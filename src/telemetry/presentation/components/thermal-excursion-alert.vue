<script setup>
import { computed } from 'vue';
import TelemetryChart from './telemetry-chart.vue';

const props = defineProps({
  container: {
    type: Object,
    default: () => ({
      id: 'SB-0182',
      serialNumber: 'MAC-7C9EBD0182',
      currentTemperature: 9.2,
      batteryLevel: 82,
      lidStatus: 'closed',
      status: 'critical'
    })
  },
  transferId: {
    type: String,
    default: 'TR-0417'
  },
  routePath: {
    type: String,
    default: 'TR-0417 · Lima → Arequipa'
  },
  incidentCode: {
    type: String,
    default: 'INC-0312'
  },
  currentTemp: {
    type: Number,
    default: 9.2
  },
  baselineTemp: {
    type: Number,
    default: 4.2
  },
  excursionStartTime: {
    type: String,
    default: '14:35'
  },
  elapsedMinutes: {
    type: Number,
    default: 8
  },
  location: {
    type: String,
    default: 'Km 312 · Panamericana Sur'
  },
  eta: {
    type: String,
    default: '15:20'
  },
  etaDelay: {
    type: String,
    default: '+45 min'
  },
  ambulancePlate: {
    type: String,
    default: 'ABQ-742'
  },
  coldIschemiaElapsed: {
    type: String,
    default: '4 h 05 min'
  },
  coldIschemiaLimit: {
    type: String,
    default: 'límite 6 h'
  },
  coldIschemiaPercent: {
    type: Number,
    default: 68
  },
  vialsCount: {
    type: Number,
    default: 24
  }
});

const emit = defineEmits([
  'acknowledge',
  'contact-cabin',
  'view-incident',
  'view-transfer'
]);

// Excursion Chart Data matching MBA-50 (14:00 4.2°C -> 14:15 4.5°C -> 14:30 6.8°C -> 14:35 8.7°C -> 14:43 9.2°C)
const excursionChartData = computed(() => [
  { time: '14:00', temperature: 4.2 },
  { time: '14:15', temperature: 4.8 },
  { time: '14:30', temperature: 6.9 },
  { time: '14:35', temperature: 8.7, isExcursion: true },
  { time: '14:43', temperature: props.currentTemp || 9.2, isExcursion: true }
]);

const formattedCurrentTemp = computed(() => {
  return `${(props.currentTemp || 9.2).toFixed(1).replace('.', ',')} °C`;
});

const formattedBaselineTemp = computed(() => {
  return `${props.baselineTemp.toFixed(1).replace('.', ',')} °C`;
});
</script>

<template>
  <div class="thermal-excursion-alert flex flex-column gap-3">
    <!-- Header: Title, Route and Critical Badge -->
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          Telemetría / <strong>{{ transferId }}</strong>
        </div>
        <h1 class="screen-title m-0">
          Excursión térmica
        </h1>
        <p class="subtitle-text m-0 mt-1">
          {{ routePath }}
        </p>
      </div>

      <!-- Critical Header Badge -->
      <div class="flex align-items-center">
        <span class="badge-critical-top">
          <span class="dot"></span>
          Crítica
        </span>
      </div>
    </div>

    <!-- Main Alert Card (MBA-50) -->
    <div class="alert-card screen-card border-round-2xl p-4 relative overflow-hidden">
      <!-- Left Red Accent Stripe -->
      <div class="alert-left-accent"></div>

      <!-- Card Top Sub-Header -->
      <div class="flex align-items-center justify-content-between mb-4 pl-2">
        <div class="flex align-items-center gap-3">
          <div class="alert-icon-box flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle text-lg text-white"></i>
          </div>
          <div>
            <h2 class="alert-banner-title m-0">
              Temperatura sobre el rango esperado
            </h2>
            <p class="alert-banner-meta m-0 mt-1">
              {{ transferId }} · {{ container.id || 'SB-0182' }} · desde {{ excursionStartTime }} · hace {{ elapsedMinutes }} min
            </p>
          </div>
        </div>

        <span class="badge-critical-inner">
          <span class="dot"></span>
          Crítica
        </span>
      </div>

      <!-- Card Body: Split Left (Metric & Range) + Right (Chart) -->
      <div class="grid m-0 align-items-center pl-2">
        <!-- Left Section: Current Temp, Range Bar & Status Cards -->
        <div class="col-12 md:col-5 p-0 pr-0 md:pr-4 mb-3 md:mb-0">
          <span class="metric-eyebrow">TEMPERATURA ACTUAL</span>
          <div class="temp-huge font-bold">
            {{ formattedCurrentTemp }}
          </div>
          <span class="temp-delta-note">
            desde {{ formattedBaselineTemp }}
          </span>

          <!-- Range Bar Section -->
          <div class="range-bar-wrapper mt-3">
            <span class="range-label mb-2 block">Rango permitido</span>
            <div class="range-track-container relative">
              <!-- Safe track with mint safe zone (2°C - 8°C) -->
              <div class="range-track">
                <div class="safe-zone" style="left: 10%; width: 68%;"></div>
              </div>
              <!-- Excursion Indicator Pin at 9.2°C -->
              <div class="range-pin-indicator" style="left: 88%;">
                <div class="pin-pill"></div>
              </div>
            </div>
            <div class="flex justify-content-between range-scale-labels mt-1">
              <span>2,0 °C</span>
              <span>8,0 °C</span>
            </div>
          </div>

          <!-- Sub-cards: Estado & Desde -->
          <div class="grid m-0 mt-3">
            <div class="col-6 p-0 pr-2">
              <div class="status-box screen-card p-2 border-round-xl">
                <span class="box-label">Estado</span>
                <span class="box-value text-critical font-bold">Fuera de rango</span>
              </div>
            </div>
            <div class="col-6 p-0 pl-1">
              <div class="status-box screen-card p-2 border-round-xl">
                <span class="box-label">Desde</span>
                <span class="box-value text-main font-bold">{{ excursionStartTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section: Continuous Excursion Chart -->
        <div class="col-12 md:col-7 p-0 pl-0 md:pl-2">
          <div class="excursion-chart-box p-2 border-round-xl">
            <telemetry-chart
              :data="excursionChartData"
              :height="150"
              :is-excursion="true"
              :show-x-axis="true"
              :x-labels="['14:00', '14:15', '14:30', '14:43']"
              :interactive="true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom 3 Cards Grid -->
    <div class="grid m-0">
      <!-- Card 1: Transporte afectado -->
      <div class="col-12 md:col-4 p-0 pr-0 md:pr-2 mb-2 md:mb-0">
        <div class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between">
          <span class="info-card-title font-bold">Transporte afectado</span>
          <div class="flex flex-column gap-2 my-2">
            <div class="flex align-items-center justify-content-between text-xs">
              <span class="text-muted">Ubicación</span>
              <span class="text-main font-semibold">{{ location }}</span>
            </div>
            <div class="flex align-items-center justify-content-between text-xs">
              <span class="text-muted">ETA</span>
              <div class="flex align-items-center gap-2">
                <span class="text-main font-semibold">{{ eta }}</span>
                <span class="badge-amber">{{ etaDelay }}</span>
              </div>
            </div>
            <div class="flex align-items-center justify-content-between text-xs">
              <span class="text-muted">Ambulancia</span>
              <span class="text-main font-semibold">{{ ambulancePlate }}</span>
            </div>
            <div class="flex align-items-center justify-content-between text-xs">
              <span class="text-muted">SmartBox</span>
              <span class="text-main font-semibold">{{ container.id || 'SB-0182' }} · batería {{ container.batteryLevel ?? 82 }} %</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Impacto en la carga -->
      <div class="col-12 md:col-4 p-0 px-0 md:px-1 mb-2 md:mb-0">
        <div class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between">
          <span class="info-card-title font-bold">Impacto en la carga</span>
          <div class="my-2">
            <div class="ischemia-huge font-bold text-main">
              {{ coldIschemiaElapsed }}
            </div>
            <p class="ischemia-subtext m-0 text-muted">
              de isquemia fría · {{ coldIschemiaLimit }}
            </p>

            <!-- Progress bar -->
            <div class="ischemia-progress-track mt-2 border-round-3xl overflow-hidden">
              <div
                class="ischemia-progress-fill border-round-3xl"
                :style="{ width: `${coldIschemiaPercent}%` }"
              ></div>
            </div>
          </div>
          <div class="text-xs text-muted">
            {{ vialsCount }} viales de vacuna · tapa cerrada
          </div>
        </div>
      </div>

      <!-- Card 3: Eventos -->
      <div class="col-12 md:col-4 p-0 pl-0 md:pl-2">
        <div class="info-card screen-card p-3 border-round-xl h-full flex flex-column justify-content-between">
          <span class="info-card-title font-bold">Eventos</span>
          <div class="flex flex-column gap-2 my-2">
            <!-- Event 1 -->
            <div class="event-row flex align-items-center justify-content-between text-xs">
              <div class="flex align-items-center gap-2">
                <span class="text-main font-bold">14:43</span>
                <span class="text-muted">Sin respuesta aún</span>
              </div>
              <span class="badge-pending">
                <span class="dot"></span>
                Pendiente
              </span>
            </div>

            <!-- Event 2 -->
            <div class="event-row flex align-items-center justify-content-between text-xs">
              <div class="flex align-items-center gap-2">
                <span class="text-main font-bold">14:35</span>
                <span class="text-muted">Push y SMS despachados</span>
              </div>
              <span class="badge-sms">
                <span class="dot"></span>
                6 s
              </span>
            </div>

            <!-- Event 3 -->
            <div class="event-row flex align-items-center justify-content-between text-xs">
              <div class="flex align-items-center gap-2">
                <span class="text-main font-bold">14:35</span>
                <span class="text-muted">Excursión detectada</span>
              </div>
              <span class="badge-danger">
                <span class="dot"></span>
                9,0 °C
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mitigation Action Buttons Bar (MBA-50) -->
    <div class="action-buttons-bar flex flex-wrap align-items-center gap-2 pt-2">
      <!-- 1. Reconocer alerta -->
      <pv-button
        class="action-btn btn-acknowledge"
        @click="emit('acknowledge')"
      >
        <i class="pi pi-check text-xs"></i>
        <span>Reconocer alerta</span>
      </pv-button>

      <!-- 2. Contactar cabina -->
      <pv-button
        class="action-btn btn-outline"
        @click="emit('contact-cabin')"
      >
        <i class="pi pi-phone text-xs"></i>
        <span>Contactar cabina</span>
      </pv-button>

      <!-- 3. Ver incidente INC-0312 -->
      <pv-button
        class="action-btn btn-outline"
        @click="emit('view-incident')"
      >
        <span>Ver incidente {{ incidentCode }}</span>
      </pv-button>

      <!-- 4. Ver detalle del traslado -->
      <pv-button
        class="action-btn btn-outline"
        @click="emit('view-transfer')"
      >
        <span>Ver detalle del traslado</span>
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
