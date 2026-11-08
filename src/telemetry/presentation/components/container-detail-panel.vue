<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTelemetryStore } from '../../application/telemetry.store.js';
import { UnlinkContainerCommand } from '../../domain/unlink-container.command.js';
import { ConfigureThermalThresholdsCommand } from '../../domain/configure-thermal-thresholds.command.js';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';

/**
 * Container detail panel implementing telemetry indicators, recent temperature curve,
 * associated rules, and HX711 weight-based stock management (MBA-30 & MBA-51).
 */
const props = defineProps({
  container: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'open-withdrawal-modal', 'unlinked']);
const router = useRouter();
const { t } = useI18n();
const telemetryStore = useTelemetryStore();
const {
  formatNumber, formatTemperature, formatKilograms, formatWeightDiff, movementDescription
} = useTelemetryFormat();

// View tab mode: 'telemetry' (MBA-30) or 'stock' (MBA-51)
const activeTab = ref('telemetry');

const thresholds = computed(() => props.container.thermalThresholds);

// Associated rules editing modal state
const isEditingRules = ref(false);
const editMinTemp = ref(thresholds.value.minCelsius);
const editMaxTemp = ref(thresholds.value.maxCelsius);
const editWarningTemp = ref(thresholds.value.warningCelsius);
const editBatteryWarning = ref(props.container.batteryWarningPercentage);
const rulesError = ref('');

// Status computations
const isOnline = computed(() => props.container.status !== 'offline');
const isLinked = computed(() => Boolean(props.container.ambulancePlate));
const thermalState = computed(() => props.container.thermalState);

// Recent temperature curve built from the container telemetry logs
async function loadLogs() {
  await telemetryStore.fetchTelemetryLogs(props.container.id);
}
onMounted(loadLogs);
watch(() => props.container.id, loadLogs);

const chartPoints = computed(() => telemetryStore.telemetryLogs
  .filter(log => log.containerId === props.container.id)
  .slice()
  .sort((a, b) => String(a.timestampUtc).localeCompare(String(b.timestampUtc)))
  .slice(-7)
  .map(log => ({ time: log.time, temp: log.temperatureCelsius })));

// Hovered tooltip for chart
const hoveredPoint = ref(null);

// SVG dimensions & path calculation
const svgWidth = 600;
const svgHeight = 180;
const paddingX = 40;
const paddingY = 30;

function getY(temp) {
  const minT = thresholds.value.minCelsius - 0.5;
  const maxT = thresholds.value.maxCelsius + 0.5;
  const clamped = Math.max(minT, Math.min(maxT, temp));
  const ratio = (clamped - minT) / (maxT - minT);
  return (svgHeight - paddingY) - ratio * (svgHeight - 2 * paddingY);
}

function getX(index, total) {
  if (total < 2) return svgWidth / 2;
  return paddingX + (index / (total - 1)) * (svgWidth - 2 * paddingX);
}

const svgLinePath = computed(() => {
  const points = chartPoints.value.map((p, i) => ({
    x: getX(i, chartPoints.value.length),
    y: getY(p.temp)
  }));

  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
});

const svgAreaPath = computed(() => {
  const line = svgLinePath.value;
  if (!line) return '';
  const lastX = getX(chartPoints.value.length - 1, chartPoints.value.length);
  const firstX = getX(0, chartPoints.value.length);
  const bottomY = svgHeight - paddingY;
  return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
});

const chartSummary = computed(() => {
  if (!chartPoints.value.length) return t('telemetry.detail.chart-empty');
  const temps = chartPoints.value.map(p => p.temp);
  return t('telemetry.detail.chart-summary', {
    count: chartPoints.value.length,
    min: formatTemperature(Math.min(...temps)),
    max: formatTemperature(Math.max(...temps))
  });
});

// Payload movements registered by the load cell (stored oldest first, shown newest first)
const movements = computed(() => [...(props.container.movements || [])].reverse());
const lastMovement = computed(() => movements.value.find(m => m.type !== 'initial') || null);

function navigateToLive() {
  router.push({ path: '/telemetry/live', query: { container: props.container.id } });
}

async function handleUnlink() {
  const message = t('telemetry.detail.unlink-confirm', { id: props.container.id, plate: props.container.ambulancePlate });
  if (!window.confirm(message)) return;
  await telemetryStore.unlinkContainer(new UnlinkContainerCommand({ containerId: props.container.id }));
  emit('unlinked', props.container.id);
}

function openEditRules() {
  editMinTemp.value = thresholds.value.minCelsius;
  editMaxTemp.value = thresholds.value.maxCelsius;
  editWarningTemp.value = thresholds.value.warningCelsius;
  editBatteryWarning.value = props.container.batteryWarningPercentage;
  rulesError.value = '';
  isEditingRules.value = true;
}

async function saveRules() {
  let command;
  try {
    command = new ConfigureThermalThresholdsCommand({
      containerId: props.container.id,
      minTemp: editMinTemp.value,
      maxTemp: editMaxTemp.value,
      warningTemp: editWarningTemp.value,
      batteryWarning: editBatteryWarning.value
    });
  } catch {
    rulesError.value = t('telemetry.rules.invalid');
    return;
  }
  await telemetryStore.updateContainerRules(command);
  isEditingRules.value = false;
}
</script>

<template>
  <div class="container-detail-panel flex flex-column gap-4">
    <!-- Top Header: Breadcrumb, Title, Mode Selector, Actions -->
    <header class="detail-header flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
      <div>
        <nav class="breadcrumb flex align-items-center gap-1 text-xs text-muted mb-1" :aria-label="t('telemetry.detail.breadcrumb')">
          <button type="button" class="breadcrumb-link cursor-pointer border-none bg-transparent p-0 text-xs text-muted" @click="emit('back')">
            {{ t('telemetry.name') }}
          </button>
          <span aria-hidden="true">/</span>
          <strong class="text-main" aria-current="page">{{ container.id }}</strong>
        </nav>

        <div class="flex align-items-center gap-3">
          <h1 class="text-2xl md:text-3xl font-bold text-main m-0">{{ t('telemetry.detail.title', { id: container.id }) }}</h1>
          <span
            class="status-pill text-xs font-semibold px-3 py-1 border-round-pill flex align-items-center gap-1"
            :class="isOnline ? 'pill-online' : 'pill-offline'"
            role="status"
          >
            <span class="status-dot" :class="isOnline ? 'dot-online' : 'dot-offline'" aria-hidden="true"></span>
            {{ isOnline ? t('telemetry.connectivity.online') : t('telemetry.connectivity.offline') }}
          </span>
        </div>

        <p class="subtitle text-xs text-muted mt-1 mb-0">
          <template v-if="activeTab === 'telemetry'">
            {{ container.model }} ·
            <span v-if="container.ambulancePlate">{{ t('telemetry.detail.linked-to') }} <strong>{{ container.ambulancePlate }}</strong></span>
            <span v-else>{{ t('telemetry.detail.no-ambulance') }}</span>
          </template>
          <template v-else>
            {{ t('telemetry.detail.stock-subtitle') }}
          </template>
        </p>
      </div>

      <!-- Action buttons & Mode Switcher -->
      <div class="header-actions flex flex-wrap align-items-center gap-2">
        <div class="mode-tabs p-1 border-round-pill flex align-items-center" role="tablist" :aria-label="t('telemetry.detail.mode-label')">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'telemetry'"
            class="tab-btn text-xs font-semibold px-3 py-1 border-round-pill border-none cursor-pointer"
            :class="{ 'tab-btn-active': activeTab === 'telemetry' }"
            @click="activeTab = 'telemetry'"
          >
            {{ t('telemetry.detail.tab-telemetry') }}
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'stock'"
            class="tab-btn text-xs font-semibold px-3 py-1 border-round-pill border-none cursor-pointer"
            :class="{ 'tab-btn-active': activeTab === 'stock' }"
            @click="activeTab = 'stock'"
          >
            {{ t('telemetry.detail.tab-stock') }}
          </button>
        </div>

        <pv-button
          v-if="isLinked"
          :label="t('telemetry.detail.unlink')"
          icon="pi pi-sync"
          class="btn-unlink px-3 py-2 text-xs border-round-pill font-medium"
          @click="handleUnlink"
        />

        <pv-button
          :label="t('telemetry.detail.view-live')"
          class="btn-live px-3 py-2 text-xs border-round-pill font-bold"
          @click="navigateToLive"
        />

        <pv-button
          :label="t('telemetry.detail.register-withdrawal')"
          class="btn-withdraw px-3 py-2 text-xs border-round-pill font-semibold"
          @click="emit('open-withdrawal-modal', container)"
        />
      </div>
    </header>

    <!-- ================= METRIC CARDS / GAUGES ================= -->

    <!-- MODE A: General telemetry (MBA-30: 6 cards) -->
    <section v-if="activeTab === 'telemetry'" class="kpi-grid grid m-0 gap-2" :aria-label="t('telemetry.detail.kpis-label')">
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.temperature')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.temperature') }}</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1" role="status">
            {{ formatTemperature(container.currentTemperature) }}
          </div>
          <span
            class="kpi-tag text-2xs px-2 py-0 border-round-pill mt-2 inline-block font-semibold"
            :class="thermalState === 'normal' ? 'tag-safe' : 'tag-warn'"
          >
            • {{ t(`telemetry.thermal.${thermalState}`) }}
          </span>
        </div>
      </div>

      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.weight')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.weight') }}</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ formatKilograms(container.netWeight) }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">{{ t('telemetry.kpi.tare', { value: formatKilograms(container.tareWeight) }) }}</small>
        </div>
      </div>

      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.battery')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.battery') }}</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ container.batteryLevel }} %
          </div>
          <div
            class="battery-track mt-2 w-full border-round-pill"
            role="meter"
            :aria-label="t('telemetry.kpi.battery')"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="container.batteryLevel"
          >
            <div class="battery-fill border-round-pill" :style="{ width: `${container.batteryLevel}%` }"></div>
          </div>
        </div>
      </div>

      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.signal')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.signal') }}</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ t(`telemetry.signal.${container.signalQuality}`) }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">{{ t('telemetry.kpi.network') }}</small>
        </div>
      </div>

      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.lid')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.lid') }}</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1 capitalize">
            {{ t(`telemetry.lid.${container.lidStatus}`) }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">{{ t('telemetry.kpi.lock') }}</small>
        </div>
      </div>

      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.location')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.location') }}</span>
          <div class="kpi-value text-base md:text-lg font-bold mt-1 text-truncate" :title="container.location">
            {{ container.location || '—' }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2 text-truncate">{{ container.currentTransferId || '—' }}</small>
        </div>
      </div>
    </section>

    <!-- MODE B: Stock by weight (MBA-51: 4 cards) -->
    <section v-else class="kpi-grid grid m-0 gap-3" :aria-label="t('telemetry.detail.kpis-label')">
      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl" role="group" :aria-label="t('telemetry.stock.total-weight')">
          <span class="kpi-label block text-xs">{{ t('telemetry.stock.total-weight') }}</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1">
            {{ formatKilograms(container.netWeight) }}
          </div>
        </div>
      </div>

      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl" role="group" :aria-label="t('telemetry.stock.last-change')">
          <span class="kpi-label block text-xs">{{ t('telemetry.stock.last-change') }}</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 text-diff-amber">
            {{ lastMovement ? formatWeightDiff(lastMovement.weightDiff) : '—' }}
          </div>
        </div>
      </div>

      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl" role="group" :aria-label="t('telemetry.stock.estimated-units')">
          <span class="kpi-label block text-xs">{{ t('telemetry.stock.estimated-units') }}</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 text-main">
            {{ container.estimatedUnits }}
          </div>
        </div>
      </div>

      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl" role="group" :aria-label="t('telemetry.kpi.lid')">
          <span class="kpi-label block text-xs">{{ t('telemetry.kpi.lid') }}</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 capitalize">
            {{ t(`telemetry.lid.${container.lidStatus}`) }}
          </div>
        </div>
      </div>
    </section>

    <!-- ================= MAIN TWO PANELS ================= -->

    <!-- MODE A PANELS: recent curve + associated rules (MBA-30) -->
    <div v-if="activeTab === 'telemetry'" class="grid m-0 gap-3">
      <div class="col-12 lg:col-8 p-0">
        <section class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.detail.chart-title')">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="panel-heading text-sm font-bold text-main m-0">{{ t('telemetry.detail.chart-title') }}</h3>
            <span
              class="text-xs font-semibold px-3 py-1 border-round-pill"
              :class="thermalState === 'normal' ? 'tag-safe' : 'tag-warn'"
            >
              • {{ t(`telemetry.thermal.${thermalState}`) }}
            </span>
          </div>

          <div class="chart-container relative w-full my-2">
            <svg
              viewBox="0 0 600 180"
              class="w-full h-auto overflow-visible"
              preserveAspectRatio="none"
              role="img"
              :aria-label="chartSummary"
            >
              <defs>
                <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0F7A70" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#0F7A70" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Upper threshold -->
              <line
                :x1="paddingX"
                :y1="getY(thresholds.maxCelsius)"
                :x2="svgWidth - paddingX"
                :y2="getY(thresholds.maxCelsius)"
                stroke="#E05A46"
                stroke-dasharray="4 4"
                stroke-width="1.5"
                opacity="0.6"
              />
              <text
                :x="paddingX - 10"
                :y="getY(thresholds.maxCelsius) + 4"
                text-anchor="end"
                font-size="11"
                fill="#5A706A"
                font-weight="500"
              >
                {{ formatTemperature(thresholds.maxCelsius, 0) }}
              </text>

              <!-- Lower threshold -->
              <line
                :x1="paddingX"
                :y1="getY(thresholds.minCelsius)"
                :x2="svgWidth - paddingX"
                :y2="getY(thresholds.minCelsius)"
                stroke="#CBD5E1"
                stroke-dasharray="3 3"
                stroke-width="1"
              />
              <text
                :x="paddingX - 10"
                :y="getY(thresholds.minCelsius) + 4"
                text-anchor="end"
                font-size="11"
                fill="#5A706A"
                font-weight="500"
              >
                {{ formatTemperature(thresholds.minCelsius, 0) }}
              </text>

              <path :d="svgAreaPath" fill="url(#tempAreaGradient)" />

              <path
                :d="svgLinePath"
                fill="none"
                stroke="#0F7A70"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g v-for="(point, idx) in chartPoints" :key="`${point.time}-${idx}`">
                <circle
                  :cx="getX(idx, chartPoints.length)"
                  :cy="getY(point.temp)"
                  r="5"
                  fill="#0F7A70"
                  stroke="#FFFFFF"
                  stroke-width="2"
                  class="chart-dot cursor-pointer"
                  @mouseenter="hoveredPoint = point"
                  @mouseleave="hoveredPoint = null"
                />
                <text
                  :x="getX(idx, chartPoints.length)"
                  :y="svgHeight - 6"
                  text-anchor="middle"
                  font-size="10"
                  fill="#94A3B8"
                >
                  {{ point.time }}
                </text>
              </g>
            </svg>

            <div v-if="hoveredPoint" class="chart-tooltip p-2 border-round-lg shadow-2 text-xs" role="tooltip">
              <strong>{{ formatTemperature(hoveredPoint.temp) }}</strong>
              <span class="text-muted block">{{ hoveredPoint.time }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Panel: Associated Rules (MBA-30) -->
      <div class="col-12 lg:col p-0">
        <section class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.rules.title')">
          <h3 class="panel-heading text-sm font-bold text-main m-0 mb-4">{{ t('telemetry.rules.title') }}</h3>

          <dl class="rules-list flex flex-column gap-3 m-0">
            <div class="rule-row flex justify-content-between align-items-center pb-3 border-bottom-subtle">
              <dt class="rule-label text-xs text-muted">{{ t('telemetry.rules.range') }}</dt>
              <dd class="flex align-items-center gap-3 m-0">
                <span class="rule-value text-sm font-bold text-main">
                  {{ formatNumber(thresholds.minCelsius) }} – {{ formatTemperature(thresholds.maxCelsius) }}
                </span>
                <pv-button
                  :label="t('telemetry.rules.edit')"
                  class="btn-edit-rule px-3 py-1 text-xs border-round-pill"
                  text
                  @click="openEditRules"
                />
              </dd>
            </div>

            <div class="rule-row flex justify-content-between align-items-center pb-3 border-bottom-subtle">
              <dt class="rule-label text-xs text-muted">{{ t('telemetry.rules.warning') }}</dt>
              <dd class="rule-value text-sm font-bold text-main m-0">{{ formatTemperature(thresholds.warningCelsius) }}</dd>
            </div>

            <div class="rule-row flex justify-content-between align-items-center pb-3">
              <dt class="rule-label text-xs text-muted">{{ t('telemetry.rules.battery') }}</dt>
              <dd class="rule-value text-sm font-bold text-main m-0">{{ t('telemetry.rules.battery-value', { value: container.batteryWarningPercentage }) }}</dd>
            </div>
          </dl>

          <div class="mt-4 p-3 bg-subtle border-round-xl">
            <span class="text-2xs text-muted block">
              <i class="pi pi-info-circle mr-1 text-teal" aria-hidden="true"></i>
              {{ t('telemetry.rules.note', { seconds: thresholds.excursionToleranceSeconds }) }}
            </span>
          </div>
        </section>
      </div>
    </div>

    <!-- MODE B PANELS: payload movements + stock calculation (MBA-51) -->
    <div v-else class="grid m-0 gap-3">
      <div class="col-12 lg:col-7 p-0">
        <section class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.stock.movements')">
          <div>
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="panel-heading text-sm font-bold text-main m-0">{{ t('telemetry.stock.movements') }}</h3>
              <pv-button
                :label="t('telemetry.stock.register')"
                class="btn-withdraw px-3 py-1 text-xs border-round-pill"
                @click="emit('open-withdrawal-modal', container)"
              />
            </div>

            <p v-if="!movements.length" class="text-xs text-muted m-0" role="status">{{ t('telemetry.stock.no-movements') }}</p>

            <ul v-else class="movements-list flex flex-column gap-2 list-none p-0 m-0">
              <li
                v-for="item in movements"
                :key="item.id"
                class="movement-row p-3 border-round-xl flex justify-content-between align-items-center"
              >
                <div class="flex align-items-center gap-3">
                  <span class="move-time text-xs font-bold text-main">{{ item.time }}</span>
                  <div>
                    <span class="move-desc text-xs text-main font-semibold">{{ movementDescription(item) }}</span>
                    <small class="text-2xs text-muted block">{{ item.responsible || '—' }}</small>
                  </div>
                </div>

                <span
                  class="move-chip text-xs font-bold px-3 py-1 border-round-pill"
                  :class="{
                    'chip-withdrawal': item.type === 'withdrawal',
                    'chip-deposit': item.type === 'deposit',
                    'chip-initial': item.type === 'initial'
                  }"
                >
                  • {{ formatWeightDiff(item.weightDiff) }}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div class="col-12 lg:col p-0">
        <section class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.stock.calculation')">
          <h3 class="panel-heading text-sm font-bold text-main m-0 mb-3">{{ t('telemetry.stock.calculation') }}</h3>

          <div class="stock-calc-box p-4 border-round-2xl">
            <dl class="flex flex-column gap-3 m-0">
              <div>
                <dt class="text-xs text-muted block">{{ t('telemetry.stock.unit-weight') }}</dt>
                <dd class="text-sm text-main font-bold m-0">{{ formatKilograms(container.unitWeight) }}</dd>
              </div>

              <div>
                <dt class="text-xs text-muted block">{{ t('telemetry.stock.recorded-diff') }}</dt>
                <dd class="text-sm text-diff-amber font-bold m-0">{{ lastMovement ? formatWeightDiff(lastMovement.weightDiff) : '—' }}</dd>
              </div>

              <div class="pt-2 border-top-subtle">
                <dt class="text-xs text-muted block">{{ t('telemetry.stock.estimated-stock') }}</dt>
                <dd class="text-lg md:text-xl font-bold text-main mt-1 m-0">
                  {{ t('telemetry.stock.units', { count: container.estimatedUnits }, container.estimatedUnits) }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="mt-4 p-3 bg-subtle border-round-xl">
            <span class="text-2xs text-muted block">
              <i class="pi pi-check text-teal mr-1" aria-hidden="true"></i>
              {{ t('telemetry.stock.sensor-note') }}
            </span>
          </div>
        </section>
      </div>
    </div>

    <!-- Edit Rules Modal Dialog -->
    <pv-dialog
      v-model:visible="isEditingRules"
      modal
      :header="t('telemetry.rules.edit-title')"
      :style="{ width: '420px', maxWidth: '95vw' }"
    >
      <div class="flex flex-column gap-3 py-2">
        <div>
          <label for="rule-min" class="block text-xs font-bold text-muted mb-1">{{ t('telemetry.rules.min') }}</label>
          <pv-input-number
            v-model="editMinTemp"
            input-id="rule-min"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            :min="0"
            :max="15"
            class="w-full"
          />
        </div>
        <div>
          <label for="rule-max" class="block text-xs font-bold text-muted mb-1">{{ t('telemetry.rules.max') }}</label>
          <pv-input-number
            v-model="editMaxTemp"
            input-id="rule-max"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            :min="0"
            :max="25"
            class="w-full"
          />
        </div>
        <div>
          <label for="rule-warning" class="block text-xs font-bold text-muted mb-1">{{ t('telemetry.rules.warning-input') }}</label>
          <pv-input-number
            v-model="editWarningTemp"
            input-id="rule-warning"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            class="w-full"
          />
        </div>
        <div>
          <label for="rule-battery" class="block text-xs font-bold text-muted mb-1">{{ t('telemetry.rules.battery-input') }}</label>
          <pv-input-number
            v-model="editBatteryWarning"
            input-id="rule-battery"
            :min="5"
            :max="90"
            suffix=" %"
            class="w-full"
          />
        </div>
        <p v-if="rulesError" class="text-xs m-0 text-red-600" role="alert">{{ rulesError }}</p>
      </div>
      <template #footer>
        <pv-button :label="t('telemetry.action.cancel')" text @click="isEditingRules = false" />
        <pv-button :label="t('telemetry.rules.save')" class="btn-live font-bold" @click="saveRules" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.container-detail-panel {
  width: 100%;
}

.text-main {
  color: #10312F;
}

.text-muted {
  color: #5A706A;
}

.text-teal {
  color: #0F7A70;
}

.text-diff-amber {
  color: #B45309;
}

.text-2xs {
  font-size: 0.7rem;
}

.breadcrumb-link:hover {
  color: #0F7A70;
  text-decoration: underline;
}

.status-pill {
  line-height: 1;
}

.pill-online {
  background-color: #E6F4EA;
  color: #137333;
}

.pill-offline {
  background-color: #F1F3F4;
  color: #5F6368;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-online {
  background-color: #137333;
}

.dot-offline {
  background-color: #5F6368;
}

.mode-tabs {
  background-color: #EAE8DE;
}

.tab-btn {
  background-color: transparent;
  color: #5A706A;
  transition: all 0.2s ease;
}

.tab-btn-active {
  background-color: #10312F !important;
  color: #FFFFFF !important;
}

.btn-unlink {
  background-color: #FFFFFF !important;
  border: 1px solid #D1D5DB !important;
  color: #10312F !important;
}

.btn-unlink:hover {
  background-color: #F9FAFB !important;
}

.btn-live {
  background-color: #10312F !important;
  border: 1px solid #10312F !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 6px rgba(16, 49, 47, 0.2);
}

.btn-live:hover {
  background-color: #0B2523 !important;
}

.btn-withdraw {
  background-color: #FFFFFF !important;
  border: 1px solid #D1D5DB !important;
  color: #10312F !important;
}

.btn-withdraw:hover {
  background-color: #F9FAFB !important;
}

.kpi-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.kpi-label {
  color: #5A706A;
}

.kpi-value {
  color: #10312F;
}

.tag-safe {
  background-color: #E6F4EA;
  color: #137333;
}

.battery-track {
  height: 4px;
  background-color: #E2E8F0;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  background-color: #10B981;
}

.content-panel {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.border-bottom-subtle {
  border-bottom: 1px solid #F0EFEA;
}

.border-top-subtle {
  border-top: 1px solid #F0EFEA;
}

.bg-subtle {
  background-color: #F9FAF8;
  border: 1px solid #ECEEEA;
}

.btn-edit-rule {
  background-color: #FFFFFF !important;
  border: 1px solid #D1D5DB !important;
  color: #374151 !important;
}

.chart-container {
  min-height: 140px;
}

.chart-dot:hover {
  r: 7;
  fill: #10312F;
}

.chart-tooltip {
  position: absolute;
  top: 10px;
  right: 20px;
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
  color: #10312F;
}

.movement-row {
  background-color: #FBFBF9;
  border: 1px solid #ECEEEA;
}

.chip-withdrawal {
  background-color: #FEF3C7;
  color: #92400E;
}

.chip-deposit {
  background-color: #D1FAE5;
  color: #065F46;
}

.chip-initial {
  background-color: #F3F4F6;
  color: #4B5563;
}

.stock-calc-box {
  background-color: #FBFBF9;
  border: 1px solid #E8E6DF;
}

/* Preventive or critical thermal state tag */
.tag-warn {
  background: #FDECEA;
  color: #B4232A;
}
</style>
