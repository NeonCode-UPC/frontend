<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTelemetryStore } from '../../application/telemetry.store.js';

/**
 * Container detail panel implementing telemetry indicators, 6h continuous curve,
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
const telemetryStore = useTelemetryStore();

// View tab mode: 'telemetry' (MBA-30) or 'stock' (MBA-51)
const activeTab = ref('telemetry');

// Associated rules editing modal state
const isEditingRules = ref(false);
const editMinTemp = ref(props.container.targetMinTemperature || 2.0);
const editMaxTemp = ref(props.container.targetMaxTemperature || 8.0);
const editWarningTemp = ref(7.5);
const editBatteryWarning = ref(20);

// Status computations
const isOnline = computed(() => props.container.status !== 'offline');
const isLinked = computed(() => Boolean(props.container.ambulancePlate));

// 6-hour continuous chart data points
const chartPoints = ref([
  { time: '08:00', temp: 4.2 },
  { time: '09:00', temp: 4.1 },
  { time: '10:00', temp: 4.3 },
  { time: '11:00', temp: 4.4 },
  { time: '12:00', temp: 4.2 },
  { time: '13:00', temp: 4.0 },
  { time: '14:00', temp: 4.2 }
]);

// Hovered tooltip for chart
const hoveredPoint = ref(null);

// SVG dimensions & path calculation
const svgWidth = 600;
const svgHeight = 180;
const paddingX = 40;
const paddingY = 30;

function getY(temp) {
  // Map 2°C (bottom) to 8°C (top)
  const minT = 1.5;
  const maxT = 8.5;
  const clamped = Math.max(minT, Math.min(maxT, temp));
  const ratio = (clamped - minT) / (maxT - minT);
  return (svgHeight - paddingY) - ratio * (svgHeight - 2 * paddingY);
}

function getX(index, total) {
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

// Movements list with defaults matching MBA-51
const movements = computed(() => {
  if (props.container.movements && props.container.movements.length > 0) {
    return props.container.movements;
  }
  return [
    { id: 'MOV-04', time: '13:20', type: 'withdrawal', description: 'Retiro de 2 viales', weightDiff: '-0.8 kg', units: -2, responsible: 'Marta Rojas' },
    { id: 'MOV-03', time: '11:05', type: 'deposit', description: 'Ingreso de 6 viales', weightDiff: '+2.4 kg', units: 6, responsible: 'Marta Rojas' },
    { id: 'MOV-01', time: '07:40', type: 'initial', description: 'Carga inicial', weightDiff: '19.2 kg', units: 24, responsible: 'Marta Rojas' }
  ];
});

function navigateToLive() {
  router.push('/telemetry/live');
}

async function handleUnlink() {
  if (!confirm(`¿Confirmas desvincular el contenedor ${props.container.id} de la ambulancia ${props.container.ambulancePlate}?`)) return;
  await telemetryStore.unlinkContainer(props.container.id);
  emit('unlinked', props.container.id);
}

function openEditRules() {
  editMinTemp.value = props.container.targetMinTemperature || 2.0;
  editMaxTemp.value = props.container.targetMaxTemperature || 8.0;
  isEditingRules.value = true;
}

async function saveRules() {
  await telemetryStore.updateContainerRules({
    containerId: props.container.id,
    minTemp: editMinTemp.value,
    maxTemp: editMaxTemp.value,
    warningTemp: editWarningTemp.value,
    batteryWarning: editBatteryWarning.value
  });
  isEditingRules.value = false;
}
</script>

<template>
  <div class="container-detail-panel flex flex-column gap-4">
    <!-- Top Header: Breadcrumb, Title, Mode Selector, Actions -->
    <header class="detail-header flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
      <div>
        <div class="breadcrumb flex align-items-center gap-1 text-xs text-muted mb-1">
          <span class="breadcrumb-link cursor-pointer" @click="emit('back')">SmartBox</span>
          <span>/</span>
          <strong class="text-main">{{ container.id }}</strong>
        </div>

        <div class="flex align-items-center gap-3">
          <h1 class="text-2xl md:text-3xl font-bold text-main m-0">SmartBox {{ container.id }}</h1>
          <span
            class="status-pill text-xs font-semibold px-3 py-1 border-round-pill flex align-items-center gap-1"
            :class="isOnline ? 'pill-online' : 'pill-offline'"
          >
            <span class="status-dot" :class="isOnline ? 'dot-online' : 'dot-offline'"></span>
            {{ isOnline ? 'En línea' : 'Sin conexión' }}
          </span>
        </div>

        <p class="subtitle text-xs text-muted mt-1 mb-0">
          <template v-if="activeTab === 'telemetry'">
            {{ container.model || 'Standard Box' }} ·
            <span v-if="container.ambulancePlate">vinculado a <strong>{{ container.ambulancePlate }}</strong></span>
            <span v-else>sin ambulancia asignada</span>
          </template>
          <template v-else>
            Detalle del contenedor · stock por peso
          </template>
        </p>
      </div>

      <!-- Action buttons & Mode Switcher -->
      <div class="header-actions flex flex-wrap align-items-center gap-2">
        <!-- View mode tabs pill -->
        <div class="mode-tabs p-1 border-round-pill flex align-items-center">
          <button
            type="button"
            class="tab-btn text-xs font-semibold px-3 py-1 border-round-pill border-none cursor-pointer"
            :class="{ 'tab-btn-active': activeTab === 'telemetry' }"
            @click="activeTab = 'telemetry'"
          >
            Telemetría y reglas
          </button>
          <button
            type="button"
            class="tab-btn text-xs font-semibold px-3 py-1 border-round-pill border-none cursor-pointer"
            :class="{ 'tab-btn-active': activeTab === 'stock' }"
            @click="activeTab = 'stock'"
          >
            Stock por peso
          </button>
        </div>

        <!-- Unlink Button (MBA-30) -->
        <pv-button
          v-if="isLinked"
          label="Desvincular"
          icon="pi pi-sync"
          class="btn-unlink px-3 py-2 text-xs border-round-pill font-medium"
          @click="handleUnlink"
        />

        <!-- Live Telemetry Button (MBA-30) -->
        <pv-button
          label="Ver telemetría"
          class="btn-live px-3 py-2 text-xs border-round-pill font-bold"
          @click="navigateToLive"
        />

        <!-- Register Withdrawal Button (MBA-51) -->
        <pv-button
          label="Registrar retiro"
          class="btn-withdraw px-3 py-2 text-xs border-round-pill font-semibold"
          @click="emit('open-withdrawal-modal', container)"
        />
      </div>
    </header>

    <!-- ================= METRIC CARDS / GAUGES ================= -->

    <!-- MODE A: Telemetría general y gauges (MBA-30: 6 cards) -->
    <section v-if="activeTab === 'telemetry'" class="kpi-grid grid m-0 gap-2">
      <!-- 1. Temperatura -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Temperatura</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ container.currentTemperature.toFixed(1).replace('.', ',') }} °C
          </div>
          <span class="kpi-tag text-2xs px-2 py-0 border-round-pill mt-2 inline-block tag-safe font-semibold">
            • En rango
          </span>
        </div>
      </div>

      <!-- 2. Peso -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Peso</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ container.netWeight.toFixed(1).replace('.', ',') }} kg
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">Tara: {{ container.tareWeight || 10.0 }} kg</small>
        </div>
      </div>

      <!-- 3. Batería 12V -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Batería 12 V</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ container.batteryLevel }} %
          </div>
          <div class="battery-track mt-2 w-full border-round-pill">
            <div
              class="battery-fill border-round-pill"
              :style="{ width: `${container.batteryLevel}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 4. Señal -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Señal</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1">
            {{ container.signalQuality || 'Fuerte' }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">Red LTE-M</small>
        </div>
      </div>

      <!-- 5. Tapa -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Tapa</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1 capitalize">
            {{ container.lidStatus === 'closed' ? 'Cerrada' : 'Abierta' }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2">Cerrojo electromecánico</small>
        </div>
      </div>

      <!-- 6. Ubicación -->
      <div class="col-6 sm:col-4 md:col-2 p-0">
        <div class="kpi-card p-3 border-round-2xl">
          <span class="kpi-label block text-xs">Ubicación</span>
          <div class="kpi-value text-xl md:text-2xl font-bold mt-1 text-truncate">
            {{ container.location ? container.location.split(' ')[0] : 'Km 312' }}
          </div>
          <small class="kpi-sub block text-2xs text-muted mt-2 text-truncate">{{ container.location || 'Panamericana Sur' }}</small>
        </div>
      </div>
    </section>

    <!-- MODE B: Stock por peso (MBA-51: 4 cards) -->
    <section v-else class="kpi-grid grid m-0 gap-3">
      <!-- 1. Peso Total -->
      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl">
          <span class="kpi-label block text-xs">Peso total</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1">
            {{ container.netWeight.toFixed(1).replace('.', ',') }} kg
          </div>
        </div>
      </div>

      <!-- 2. Último Cambio -->
      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl">
          <span class="kpi-label block text-xs">Último cambio</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 text-diff-amber">
            -0,8 kg
          </div>
        </div>
      </div>

      <!-- 3. Unidades Estimadas -->
      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl">
          <span class="kpi-label block text-xs">Unidades estimadas</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 text-main">
            {{ container.estimatedUnits || 23 }}
          </div>
        </div>
      </div>

      <!-- 4. Tapa -->
      <div class="col-12 sm:col-6 md:col-3 p-0">
        <div class="kpi-card p-4 border-round-2xl">
          <span class="kpi-label block text-xs">Tapa</span>
          <div class="kpi-value text-2xl md:text-3xl font-bold mt-1 capitalize">
            {{ container.lidStatus === 'closed' ? 'Cerrada' : 'Abierta' }}
          </div>
        </div>
      </div>
    </section>

    <!-- ================= MAIN TWO PANELS ================= -->

    <!-- MODE A PANELS: Gráfica 6h + Reglas asociadas (MBA-30) -->
    <div v-if="activeTab === 'telemetry'" class="grid m-0 gap-3">
      <!-- Left Panel: 6h Continuous Chart -->
      <div class="col-12 lg:col-8 p-0">
        <div class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="panel-heading text-sm font-bold text-main m-0">Temperatura · 6 h</h3>
            <span class="tag-safe text-xs font-semibold px-3 py-1 border-round-pill">
              • En rango
            </span>
          </div>

          <!-- Continuous Line Chart SVG Container -->
          <div class="chart-container relative w-full my-2">
            <svg
              viewBox="0 0 600 180"
              class="w-full h-auto overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0F7A70" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#0F7A70" stop-opacity="0.02" />
                </linearGradient>
              </defs>

              <!-- Threshold Top line: 8 °C (dashed salmon) -->
              <line
                :x1="paddingX"
                :y1="getY(8.0)"
                :x2="svgWidth - paddingX"
                :y2="getY(8.0)"
                stroke="#E05A46"
                stroke-dasharray="4 4"
                stroke-width="1.5"
                opacity="0.6"
              />
              <text
                :x="paddingX - 10"
                :y="getY(8.0) + 4"
                text-anchor="end"
                font-size="11"
                fill="#5A706A"
                font-weight="500"
              >
                8 °C
              </text>

              <!-- Threshold Bottom line: 2 °C (subtle dashed) -->
              <line
                :x1="paddingX"
                :y1="getY(2.0)"
                :x2="svgWidth - paddingX"
                :y2="getY(2.0)"
                stroke="#CBD5E1"
                stroke-dasharray="3 3"
                stroke-width="1"
              />
              <text
                :x="paddingX - 10"
                :y="getY(2.0) + 4"
                text-anchor="end"
                font-size="11"
                fill="#5A706A"
                font-weight="500"
              >
                2 °C
              </text>

              <!-- Area Fill -->
              <path
                :d="svgAreaPath"
                fill="url(#tempAreaGradient)"
              />

              <!-- Continuous Smooth Bezier Line -->
              <path
                :d="svgLinePath"
                fill="none"
                stroke="#0F7A70"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Interactive Points -->
              <g v-for="(point, idx) in chartPoints" :key="point.time">
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
                <!-- Time labels along bottom -->
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

            <!-- Hover tooltip -->
            <div
              v-if="hoveredPoint"
              class="chart-tooltip p-2 border-round-lg shadow-2 text-xs"
            >
              <strong>{{ hoveredPoint.temp }} °C</strong>
              <span class="text-muted block">{{ hoveredPoint.time }} hrs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Associated Rules (MBA-30) -->
      <div class="col-12 lg:col p-0">
        <div class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between">
          <h3 class="panel-heading text-sm font-bold text-main m-0 mb-4">Reglas asociadas</h3>

          <div class="rules-list flex flex-column gap-3">
            <!-- Row 1: Rango -->
            <div class="rule-row flex justify-content-between align-items-center pb-3 border-bottom-subtle">
              <span class="rule-label text-xs text-muted">Rango</span>
              <div class="flex align-items-center gap-3">
                <span class="rule-value text-sm font-bold text-main">
                  {{ container.targetMinTemperature?.toFixed(1).replace('.', ',') || '2,0' }} – {{ container.targetMaxTemperature?.toFixed(1).replace('.', ',') || '8,0' }} °C
                </span>
                <pv-button
                  label="Editar"
                  class="btn-edit-rule px-3 py-1 text-xs border-round-pill"
                  text
                  @click="openEditRules"
                />
              </div>
            </div>

            <!-- Row 2: Aviso -->
            <div class="rule-row flex justify-content-between align-items-center pb-3 border-bottom-subtle">
              <span class="rule-label text-xs text-muted">Aviso</span>
              <span class="rule-value text-sm font-bold text-main">7,5 °C</span>
            </div>

            <!-- Row 3: Batería -->
            <div class="rule-row flex justify-content-between align-items-center pb-3">
              <span class="rule-label text-xs text-muted">Batería</span>
              <span class="rule-value text-sm font-bold text-main">Aviso al 20 %</span>
            </div>
          </div>

          <div class="mt-4 p-3 bg-subtle border-round-xl">
            <span class="text-2xs text-muted block">
              <i class="pi pi-info-circle mr-1 text-teal"></i>
              Las alertas se despachan automáticamente al centro de control ante variación térmica continua > 3 min.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE B PANELS: Movimientos de insumos + Cálculo de stock (MBA-51) -->
    <div v-else class="grid m-0 gap-3">
      <!-- Left Panel: Movimientos de insumos -->
      <div class="col-12 lg:col-7 p-0">
        <div class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between">
          <div>
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="panel-heading text-sm font-bold text-main m-0">Movimientos de insumos</h3>
              <pv-button
                label="+ Registrar"
                class="btn-withdraw px-3 py-1 text-xs border-round-pill"
                @click="emit('open-withdrawal-modal', container)"
              />
            </div>

            <div class="movements-list flex flex-column gap-2">
              <div
                v-for="item in movements"
                :key="item.id"
                class="movement-row p-3 border-round-xl flex justify-content-between align-items-center"
              >
                <div class="flex align-items-center gap-3">
                  <span class="move-time text-xs font-bold text-main">{{ item.time }}</span>
                  <div>
                    <span class="move-desc text-xs text-main font-semibold">{{ item.description }}</span>
                    <small class="text-2xs text-muted block">{{ item.responsible || 'Marta Rojas' }}</small>
                  </div>
                </div>

                <span
                  class="move-chip text-xs font-bold px-3 py-1 border-round-pill"
                  :class="{
                    'chip-withdrawal': item.weightDiff?.includes('-') || item.type === 'withdrawal',
                    'chip-deposit': item.weightDiff?.includes('+') || item.type === 'deposit',
                    'chip-initial': item.type === 'initial'
                  }"
                >
                  • {{ item.weightDiff }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Cálculo de stock -->
      <div class="col-12 lg:col p-0">
        <div class="content-panel p-4 border-round-2xl h-full flex flex-column justify-content-between">
          <h3 class="panel-heading text-sm font-bold text-main m-0 mb-3">Cálculo de stock</h3>

          <div class="stock-calc-box p-4 border-round-2xl">
            <div class="flex flex-column gap-3">
              <div>
                <span class="text-xs text-muted block">Peso por unidad:</span>
                <strong class="text-sm text-main">{{ container.unitWeight || 0.4 }} kg</strong>
              </div>

              <div>
                <span class="text-xs text-muted block">Diferencia registrada:</span>
                <strong class="text-sm text-diff-amber">-0,8 kg</strong>
              </div>

              <div class="pt-2 border-top-subtle">
                <span class="text-xs text-muted block">Stock estimado:</span>
                <div class="text-lg md:text-xl font-bold text-main mt-1">
                  {{ container.estimatedUnits || 23 }} unidades
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-subtle border-round-xl">
            <span class="text-2xs text-muted block">
              <i class="pi pi-check text-teal mr-1"></i>
              Sensor HX711 calibrado con celda de carga de precisión médica. Tolerancia ±2 viales.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Rules Modal Dialog -->
    <pv-dialog
      v-model:visible="isEditingRules"
      modal
      header="Editar Reglas de Conservación"
      :style="{ width: '420px', maxWidth: '95vw' }"
    >
      <div class="flex flex-column gap-3 py-2">
        <div>
          <label class="block text-xs font-bold text-muted mb-1">Temperatura Mínima (°C)</label>
          <pv-input-number
            v-model="editMinTemp"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            :min="0"
            :max="15"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-muted mb-1">Temperatura Máxima (°C)</label>
          <pv-input-number
            v-model="editMaxTemp"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            :min="0"
            :max="25"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-muted mb-1">Umbral Preventivo de Alerta (°C)</label>
          <pv-input-number
            v-model="editWarningTemp"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <pv-button label="Cancelar" text @click="isEditingRules = false" />
        <pv-button label="Guardar Reglas" class="btn-live font-bold" @click="saveRules" />
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
</style>
