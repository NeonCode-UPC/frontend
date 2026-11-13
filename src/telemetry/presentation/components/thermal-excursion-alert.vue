<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';
import TelemetryChart from './telemetry-chart.vue';

const props = defineProps({
  container: {
    type: Object,
    required: true
  },
  logs: {
    type: Array,
    default: () => []
  },
  /** ISO timestamp of the reading that started the excursion. */
  excursionStartedAt: {
    type: String,
    default: null
  },
  acknowledged: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['acknowledge', 'view-incident', 'view-transfer']);
const { t } = useI18n();
const { formatNumber, formatTemperature, formatDateTime } = useTelemetryFormat();

const thresholds = computed(() => props.container.thermalThresholds);
const thermalState = computed(() => props.container.thermalState);
const isOutOfRange = computed(() => !thresholds.value.isInRange(props.container.currentTemperature));

const timeLabel = (iso) => {
  const match = String(iso || '').match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '';
};

// Recent readings of this container plus the current one (chronological)
const excursionChartData = computed(() => {
  const recent = props.logs
    .filter(log => props.container.ownsTelemetryLog(log))
    .slice()
    .sort((a, b) => String(a.timestampUtc).localeCompare(String(b.timestampUtc)))
    .slice(-4)
    .map(log => ({ time: log.time, temperature: log.temperatureCelsius }));
  const last = recent[recent.length - 1];
  if (!last || last.temperature !== props.container.currentTemperature) {
    recent.push({
      time: timeLabel(props.excursionStartedAt || props.container.lastTelemetryAt),
      temperature: props.container.currentTemperature,
      isExcursion: isOutOfRange.value
    });
  }
  return recent;
});

const baselineTemp = computed(() => excursionChartData.value[0]?.temperature ?? props.container.currentTemperature);

const elapsedMinutes = computed(() => {
  if (!props.excursionStartedAt) return 0;
  const wallClock = String(props.excursionStartedAt).replace(/\.\d+Z$|Z$/, '');
  return Math.max(0, Math.round((Date.now() - new Date(wallClock).getTime()) / 60000));
});

// Range bar geometry: scale from (min - 2 °C) to (max + 2 °C)
const scale = computed(() => ({ lo: thresholds.value.minCelsius - 2, hi: thresholds.value.maxCelsius + 2 }));
const toPercent = (value) => {
  const { lo, hi } = scale.value;
  return Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100));
};
const safeZoneStyle = computed(() => ({
  left: `${toPercent(thresholds.value.minCelsius)}%`,
  width: `${toPercent(thresholds.value.maxCelsius) - toPercent(thresholds.value.minCelsius)}%`
}));
const pinStyle = computed(() => ({ left: `${toPercent(props.container.currentTemperature)}%` }));

// Events derived from the readings
const events = computed(() => {
  const list = [];
  const warning = excursionChartData.value.find(p => p.temperature >= thresholds.value.warningCelsius && thresholds.value.isInRange(p.temperature));
  const critical = excursionChartData.value.find(p => !thresholds.value.isInRange(p.temperature));
  if (critical) {
    list.push({ time: critical.time, text: t('telemetry.excursion.event-detected'), badge: formatTemperature(critical.temperature), kind: 'danger' });
  }
  if (warning) {
    list.push({ time: warning.time, text: t('telemetry.excursion.event-warning'), badge: formatTemperature(warning.temperature), kind: 'sms' });
  }
  list.unshift({
    time: timeLabel(props.container.lastTelemetryAt) || excursionChartData.value.at(-1)?.time,
    text: props.acknowledged ? t('telemetry.excursion.event-acknowledged') : t('telemetry.excursion.event-pending'),
    badge: props.acknowledged ? t('telemetry.excursion.done') : t('telemetry.excursion.pending'),
    kind: props.acknowledged ? 'sms' : 'pending'
  });
  return list;
});
</script>

<template>
  <div class="thermal-excursion-alert flex flex-column gap-3">
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          {{ t('telemetry.live.breadcrumb') }} / <strong>{{ container.currentTransferId || container.displayCode }}</strong>
        </div>
        <h1 class="screen-title m-0">
          {{ t('telemetry.excursion.title') }}
        </h1>
        <p class="subtitle-text m-0 mt-1">
          {{ container.displayCode }} · {{ container.ambulancePlate || t('telemetry.detail.no-ambulance') }}
        </p>
      </div>

      <div class="flex align-items-center">
        <span class="badge-critical-top">
          <span class="dot" aria-hidden="true"></span>
          {{ t(`telemetry.thermal.${thermalState}`) }}
        </span>
      </div>
    </div>

    <!-- Main Alert Card (MBA-50) -->
    <section
      class="alert-card screen-card border-round-2xl p-4 relative overflow-hidden"
      :role="isOutOfRange ? 'alert' : 'region'"
      :aria-live="isOutOfRange ? 'assertive' : undefined"
      :aria-label="t('telemetry.excursion.title')"
    >
      <div class="alert-left-accent" aria-hidden="true"></div>

      <div class="flex align-items-center justify-content-between mb-4 pl-2">
        <div class="flex align-items-center gap-3">
          <div class="alert-icon-box flex align-items-center justify-content-center" aria-hidden="true">
            <i class="pi pi-exclamation-triangle text-lg text-white"></i>
          </div>
          <div>
            <h2 class="alert-banner-title m-0">
              {{ isOutOfRange ? t('telemetry.excursion.out-of-range') : t('telemetry.excursion.in-range') }}
            </h2>
            <p class="alert-banner-meta m-0 mt-1">
              {{ t('telemetry.excursion.meta', {
                id: container.displayCode,
                since: formatDateTime(excursionStartedAt || container.lastTelemetryAt),
                minutes: elapsedMinutes
              }) }}
            </p>
          </div>
        </div>

        <span class="badge-critical-inner">
          <span class="dot" aria-hidden="true"></span>
          {{ t(`telemetry.thermal.${thermalState}`) }}
        </span>
      </div>

      <div class="grid m-0 align-items-center pl-2">
        <div class="col-12 md:col-5 p-0 pr-0 md:pr-4 mb-3 md:mb-0">
          <span class="metric-eyebrow">{{ t('telemetry.excursion.current-temp') }}</span>
          <div class="temp-huge font-bold">
            {{ formatTemperature(container.currentTemperature) }}
          </div>
          <span class="temp-delta-note">
            {{ t('telemetry.excursion.from', { value: formatTemperature(baselineTemp) }) }}
          </span>

          <div class="range-bar-wrapper mt-3">
            <span id="excursion-range-label" class="range-label mb-2 block">{{ t('telemetry.excursion.allowed-range') }}</span>
            <div
              class="range-track-container relative"
              role="meter"
              aria-labelledby="excursion-range-label"
              :aria-valuemin="scale.lo"
              :aria-valuemax="scale.hi"
              :aria-valuenow="container.currentTemperature"
              :aria-valuetext="formatTemperature(container.currentTemperature)"
            >
              <div class="range-track">
                <div class="safe-zone" :style="safeZoneStyle"></div>
              </div>
              <div class="range-pin-indicator" :style="pinStyle">
                <div class="pin-pill"></div>
              </div>
            </div>
            <div class="flex justify-content-between range-scale-labels mt-1">
              <span>{{ formatTemperature(thresholds.minCelsius) }}</span>
              <span>{{ formatTemperature(thresholds.maxCelsius) }}</span>
            </div>
          </div>

          <dl class="grid m-0 mt-3">
            <div class="col-6 p-0 pr-2">
              <div class="status-box screen-card p-2 border-round-xl">
                <dt class="box-label">{{ t('telemetry.excursion.state') }}</dt>
                <dd class="box-value font-bold m-0" :class="isOutOfRange ? 'text-critical' : 'text-main'">
                  {{ isOutOfRange ? t('telemetry.excursion.out-of-range-short') : t('telemetry.thermal.normal') }}
                </dd>
              </div>
            </div>
            <div class="col-6 p-0 pl-1">
              <div class="status-box screen-card p-2 border-round-xl">
                <dt class="box-label">{{ t('telemetry.excursion.tolerance') }}</dt>
                <dd class="box-value text-main font-bold m-0">{{ thresholds.excursionToleranceSeconds }} s</dd>
              </div>
            </div>
          </dl>
        </div>

        <div class="col-12 md:col-7 p-0 pl-0 md:pl-2">
          <div class="excursion-chart-box p-2 border-round-xl">
            <telemetry-chart
              :data="excursionChartData"
              :height="150"
              :is-excursion="isOutOfRange"
              :show-x-axis="true"
              :x-labels="excursionChartData.map(p => p.time)"
              :safe-min="thresholds.minCelsius"
              :safe-max="thresholds.maxCelsius"
              :interactive="true"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="grid m-0">
      <!-- Card 1: Affected container -->
      <div class="col-12 md:col-4 p-0 pr-0 md:pr-2 mb-2 md:mb-0">
        <section class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.excursion.affected')">
          <span class="info-card-title font-bold">{{ t('telemetry.excursion.affected') }}</span>
          <dl class="flex flex-column gap-2 my-2">
            <div class="flex align-items-center justify-content-between text-xs">
              <dt class="text-muted">{{ t('telemetry.kpi.location') }}</dt>
              <dd class="text-main font-semibold m-0">{{ container.location || '—' }}</dd>
            </div>
            <div class="flex align-items-center justify-content-between text-xs">
              <dt class="text-muted">{{ t('telemetry.card.ambulance') }}</dt>
              <dd class="text-main font-semibold m-0">{{ container.ambulancePlate || '—' }}</dd>
            </div>
            <div class="flex align-items-center justify-content-between text-xs">
              <dt class="text-muted">{{ t('telemetry.name') }}</dt>
              <dd class="text-main font-semibold m-0">{{ t('telemetry.excursion.box-battery', { id: container.displayCode, value: container.batteryLevel }) }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Card 2: Payload -->
      <div class="col-12 md:col-4 p-0 px-0 md:px-1 mb-2 md:mb-0">
        <section class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.excursion.payload')">
          <span class="info-card-title font-bold">{{ t('telemetry.excursion.payload') }}</span>
          <div class="my-2">
            <div class="ischemia-huge font-bold text-main">
              {{ t('telemetry.withdrawal.vials', { count: container.estimatedUnits }, container.estimatedUnits) }}
            </div>
            <p class="ischemia-subtext m-0 text-muted">
              {{ t('telemetry.excursion.payload-detail', { weight: formatNumber(container.netWeight), lid: t(`telemetry.lid.${container.lidStatus}`) }) }}
            </p>
          </div>
        </section>
      </div>

      <!-- Card 3: Events -->
      <div class="col-12 md:col-4 p-0 pl-0 md:pl-2">
        <section class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between" :aria-label="t('telemetry.excursion.events')">
          <span class="info-card-title font-bold">{{ t('telemetry.excursion.events') }}</span>
          <ul class="flex flex-column gap-2 my-2 list-none p-0">
            <li
              v-for="(event, idx) in events"
              :key="idx"
              class="event-row flex align-items-center justify-content-between text-xs"
            >
              <div class="flex align-items-center gap-2">
                <span class="text-main font-bold">{{ event.time }}</span>
                <span class="text-muted">{{ event.text }}</span>
              </div>
              <span :class="`badge-${event.kind}`">
                <span class="dot" aria-hidden="true"></span>
                {{ event.badge }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- Mitigation Action Buttons Bar (MBA-50) -->
    <div class="action-buttons-bar flex flex-wrap align-items-center gap-2 pt-2">
      <pv-button class="action-btn btn-acknowledge" :disabled="acknowledged" @click="emit('acknowledge')">
        <i class="pi pi-check text-xs" aria-hidden="true"></i>
        <span>{{ t('telemetry.excursion.acknowledge') }}</span>
      </pv-button>

      <pv-button class="action-btn btn-outline" @click="emit('view-incident')">
        <span>{{ t('telemetry.excursion.view-incidents') }}</span>
      </pv-button>

      <pv-button v-if="container.currentTransferId" class="action-btn btn-outline" @click="emit('view-transfer')">
        <span>{{ t('telemetry.excursion.view-transfer') }}</span>
      </pv-button>
    </div>
  </div>
</template>

<style scoped>
.thermal-excursion-alert {
  width: 100%;
}

.breadcrumb-text {
  font-size: 0.72rem;
  color: #5A706A;
}

.breadcrumb-text strong {
  color: #10312F;
}

.screen-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #10312F;
  letter-spacing: -0.02em;
}

.subtitle-text {
  font-size: 0.8rem;
  color: #5A706A;
}

/* Badges */
.badge-critical-top {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background-color: #FDF2F0;
  border: 1px solid #F9D0CB;
  color: #E05A46;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-critical-top .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #E05A46;
}

/* Main Alert Card */
.alert-card {
  background-color: #FFFFFF;
  border: 1px solid #F6D7D2;
  box-shadow: 0 2px 8px rgba(224, 90, 70, 0.06);
}

.alert-left-accent {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  background-color: #E05A46;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

.alert-icon-box {
  width: 36px;
  height: 36px;
  background-color: #E05A46;
  border-radius: 10px;
}

.alert-banner-title {
  font-size: 0.96rem;
  font-weight: 700;
  color: #10312F;
}

.alert-banner-meta {
  font-size: 0.72rem;
  color: #5A706A;
}

.badge-critical-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  background-color: #FDF2F0;
  border-radius: 9999px;
  color: #E05A46;
  font-size: 0.68rem;
  font-weight: 700;
}

.badge-critical-inner .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #E05A46;
}

/* Left Section: Temp & Range */
.metric-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  color: #8C9E99;
  letter-spacing: 0.05em;
}

.temp-huge {
  font-size: 2.6rem;
  line-height: 1.1;
  color: #E05A46;
  letter-spacing: -0.03em;
}

.temp-delta-note {
  font-size: 0.72rem;
  color: #5A706A;
}

.range-label {
  font-size: 0.7rem;
  color: #5A706A;
  font-weight: 500;
}

.range-track {
  height: 7px;
  background-color: #E4EAE6;
  border-radius: 9999px;
  position: relative;
  overflow: hidden;
}

.safe-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: #B9DDA0;
  border-radius: 9999px;
}

.range-pin-indicator {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
}

.pin-pill {
  width: 4px;
  height: 15px;
  background-color: #E05A46;
  border-radius: 9999px;
  box-shadow: 0 0 4px rgba(224, 90, 70, 0.4);
}

.range-scale-labels {
  font-size: 0.68rem;
  color: #8C9E99;
  font-weight: 500;
}

.status-box {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.box-label {
  display: block;
  font-size: 0.65rem;
  color: #5A706A;
}

.box-value {
  font-size: 0.85rem;
}

.text-critical {
  color: #E05A46 !important;
}

.excursion-chart-box {
  background: #FAF9F6;
  border: 1px solid #ECEAE1;
}

/* Bottom 3 Info Cards */
.info-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
  min-height: 140px;
}

.info-card-title {
  font-size: 0.82rem;
  color: #10312F;
}

.badge-amber {
  background-color: #FDF3E7;
  color: #E89332;
  border-radius: 9999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
}

.ischemia-huge {
  font-size: 1.45rem;
  letter-spacing: -0.02em;
}

.ischemia-subtext {
  font-size: 0.72rem;
}

.ischemia-progress-track {
  height: 6px;
  background-color: #E4EAE6;
  width: 100%;
}

.ischemia-progress-fill {
  height: 100%;
  background-color: #0F7A70;
}

/* Event badges */
.badge-pending {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #FDF3E7;
  color: #D67A18;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
}

.badge-pending .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #E89332;
}

.badge-sms {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #EBF7EE;
  color: #1E6B38;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
}

.badge-sms .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #22C55E;
}

.badge-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #FDF2F0;
  color: #E05A46;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
}

.badge-danger .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #E05A46;
}

/* Mitigation Buttons */
.action-btn {
  border-radius: 9999px !important;
  font-size: 0.74rem !important;
  font-weight: 600 !important;
  padding: 0.45rem 1rem !important;
  box-shadow: none !important;
}

.btn-acknowledge {
  background-color: #10312F !important;
  color: #FFFFFF !important;
  border: 1px solid #10312F !important;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-acknowledge:hover {
  background-color: #184643 !important;
}

.btn-outline {
  background-color: #FFFFFF !important;
  color: #10312F !important;
  border: 1px solid #D2DDD7 !important;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-outline:hover {
  background-color: #F6F9F7 !important;
}
</style>
