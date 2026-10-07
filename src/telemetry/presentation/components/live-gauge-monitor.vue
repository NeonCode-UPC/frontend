<script setup>
import { computed } from 'vue';
import TelemetryChart from './telemetry-chart.vue';

const props = defineProps({
  container: {
    type: Object,
    default: () => ({
      id: 'SB-0182',
      serialNumber: 'MAC-7C9EBD0182',
      currentTemperature: 4.2,
      batteryLevel: 82,
      lidStatus: 'closed',
      netWeight: 18.4,
      status: 'online'
    })
  },
  transferId: {
    type: String,
    default: 'TR-0417'
  },
  routeOrigin: {
    type: String,
    default: 'Clínica San Borja'
  },
  routeDestination: {
    type: String,
    default: 'Hosp. Goyeneche'
  },
  routePath: {
    type: String,
    default: 'Lima → Arequipa'
  },
  eta: {
    type: String,
    default: '14:35'
  },
  logs: {
    type: Array,
    default: () => []
  }
});

// Normalized logs for the 6-hour continuous chart
const sixHourLogs = computed(() => {
  if (props.logs && props.logs.length >= 5) {
    // Return recent logs reversed in chronological order if needed
    const sorted = [...props.logs]
      .filter(l => l.temperature <= 8.0)
      .slice(0, 14)
      .reverse();
    return sorted;
  }
  // Default 6h mock curve mirroring Figma MBA-49 (4.0 -> 4.5 -> 4.2 -> 4.3 -> 4.2 °C)
  return [
    { time: '08:00', temperature: 4.0 },
    { time: '09:00', temperature: 4.2 },
    { time: '10:00', temperature: 4.1 },
    { time: '11:00', temperature: 4.5 },
    { time: '12:00', temperature: 4.3 },
    { time: '13:00', temperature: 4.1 },
    { time: '13:40', temperature: props.container.currentTemperature || 4.2 }
  ];
});

const isLidClosed = computed(() => {
  return props.container.lidStatus === 'closed';
});

const temperatureDisplay = computed(() => {
  const temp = props.container.currentTemperature ?? 4.2;
  return `${temp.toFixed(1).replace('.', ',')} °C`;
});

const batteryDisplay = computed(() => {
  return `${props.container.batteryLevel ?? 82} %`;
});

const lidDisplay = computed(() => {
  return isLidClosed.value ? 'Cerrada' : 'Abierta';
});
</script>

<template>
  <div class="live-gauge-monitor flex flex-column gap-3">
    <!-- Header: Title, Origin-Destination & Status Badges -->
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          Telemetría / <strong>{{ transferId }}</strong>
        </div>
        <h1 class="screen-title m-0">
          {{ transferId }}
        </h1>
        <p class="subtitle-text m-0 mt-1">
          {{ routePath }} · {{ container.id || 'SB-0182' }}
        </p>
      </div>

      <!-- Top Right Status Badges -->
      <div class="flex align-items-center gap-2">
        <span class="status-pill in-transit">
          <span class="pulse-dot"></span>
          En tránsito
        </span>
        <span class="status-pill container-badge">
          <span class="static-dot"></span>
          {{ container.id || 'SB-0182' }}
        </span>
      </div>
    </div>

    <!-- Main Content Grid: Map (Left) & Metrics (Right) -->
    <div class="grid m-0 nested-grid">
      <!-- Left Column: Stylized Route Map Container -->
      <div class="col-12 lg:col-7 p-0 pr-0 lg:pr-3 mb-3 lg:mb-0">
        <div class="map-card screen-card border-round-2xl relative overflow-hidden flex flex-column justify-content-between">
          <!-- Background Grid & Stylized SVG Map -->
          <svg class="map-svg-background" viewBox="0 0 680 430" preserveAspectRatio="none">
            <defs>
              <!-- Grid pattern -->
              <pattern id="medicalMapGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#DCE7E0" stroke-width="0.8" opacity="0.8" />
              </pattern>

              <!-- Soft hill landscape gradient -->
              <linearGradient id="mapHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#E2EDE4" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#E9F2EB" stop-opacity="0.2" />
              </linearGradient>

              <!-- Route Line Gradient -->
              <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0F7A70" />
                <stop offset="50%" stop-color="#15645E" />
                <stop offset="100%" stop-color="#8DBBA4" />
              </linearGradient>
            </defs>

            <!-- Base Canvas Fill -->
            <rect width="100%" height="100%" fill="#EEF4EE" />

            <!-- Medical Grid lines -->
            <rect width="100%" height="100%" fill="url(#medicalMapGrid)" />

            <!-- Soft Topography Curves -->
            <path d="M 0,380 Q 200,320 380,360 T 680,310 L 680,430 L 0,430 Z" fill="url(#mapHillGrad)" />
            <path d="M 0,260 Q 220,180 440,240 T 680,180 L 680,430 L 0,430 Z" fill="#E4EFE6" opacity="0.4" />

            <!-- Route Track Glow -->
            <path
              d="M 160,335 C 210,325 240,240 330,225 C 410,210 500,230 580,165"
              fill="none"
              stroke="#B9DDA0"
              stroke-width="10"
              stroke-linecap="round"
              opacity="0.45"
            />

            <!-- Route Track Main Line -->
            <path
              d="M 160,335 C 210,325 240,240 330,225 C 410,210 500,230 580,165"
              fill="none"
              stroke="url(#routeGradient)"
              stroke-width="4.5"
              stroke-linecap="round"
            />
          </svg>

          <!-- Interactive Elements & Pins Overlay -->
          <div class="map-overlay-layer">
            <!-- Origin Pin (Clínica San Borja) -->
            <div class="map-pin origin-pin" style="left: 22%; top: 78%;">
              <div class="pin-badge">
                <span class="pin-circle origin-circle"></span>
                <span class="pin-label">{{ routeOrigin }}</span>
              </div>
            </div>

            <!-- Moving Ambulance Pin (Active in transit) -->
            <div class="map-pin ambulance-pin" style="left: 48%; top: 52%;">
              <div class="ambulance-vehicle-badge shadow-3">
                <i class="pi pi-car text-white text-base"></i>
                <div class="pulse-beacon"></div>
              </div>
            </div>

            <!-- Destination Pin (Hosp. Goyeneche) -->
            <div class="map-pin destination-pin" style="left: 85%; top: 38%;">
              <div class="pin-badge">
                <span class="pin-circle destination-circle"></span>
                <span class="pin-label">{{ routeDestination }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom HUD Stats Bar -->
          <div class="map-hud-bar flex align-items-center justify-content-between p-3">
            <div class="flex align-items-center gap-2">
              <span class="hud-tag">
                <i class="pi pi-compass text-xs"></i>
                Panamericana Sur · Km 312
              </span>
              <span class="hud-tag hidden sm:inline-flex">
                <i class="pi pi-wifi text-xs text-teal"></i>
                Enlace 4G LTE Activo
              </span>
            </div>
            <div class="text-xs font-semibold text-main">
              Velocidad: <span class="text-teal">68 km/h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: 2x2 Metric Cards + 6h Chart Card -->
      <div class="col-12 lg:col-5 p-0 flex flex-column gap-3">
        <!-- 2x2 Grid of Floating Cards -->
        <div class="grid m-0">
          <!-- Card 1: Temperatura -->
          <div class="col-6 p-0 pr-2 pb-2">
            <div class="metric-card screen-card p-3 border-round-xl">
              <span class="metric-label">Temperatura</span>
              <span class="metric-value font-bold">{{ temperatureDisplay }}</span>
            </div>
          </div>

          <!-- Card 2: Tapa -->
          <div class="col-6 p-0 pl-1 pb-2">
            <div class="metric-card screen-card p-3 border-round-xl">
              <span class="metric-label">Tapa</span>
              <span class="metric-value font-bold text-main">{{ lidDisplay }}</span>
            </div>
          </div>

          <!-- Card 3: Batería -->
          <div class="col-6 p-0 pr-2 pt-1">
            <div class="metric-card screen-card p-3 border-round-xl">
              <span class="metric-label">Batería</span>
              <span class="metric-value font-bold">{{ batteryDisplay }}</span>
            </div>
          </div>

          <!-- Card 4: ETA -->
          <div class="col-6 p-0 pl-1 pt-1">
            <div class="metric-card screen-card p-3 border-round-xl">
              <span class="metric-label">ETA</span>
              <span class="metric-value font-bold text-main">{{ eta }}</span>
            </div>
          </div>
        </div>

        <!-- Chart Card: Temperatura 6 h -->
        <div class="chart-summary-card screen-card p-3 border-round-xl flex flex-column justify-content-between">
          <div class="flex align-items-center justify-content-between mb-2">
            <span class="chart-card-title font-bold">Temperatura · 6 h</span>
            <span class="badge-en-rango">
              <span class="dot"></span>
              En rango
            </span>
          </div>

          <!-- Continuous Chart Component -->
          <div class="chart-wrapper">
            <telemetry-chart
              :data="sixHourLogs"
              :height="115"
              :interactive="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-gauge-monitor {
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

/* Status Pills matching Figma */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  background-color: #FFFFFF;
}

.status-pill.in-transit {
  border: 1.5px solid #10312F;
  color: #10312F;
}

.status-pill.container-badge {
  border: 1px solid #DCE3E0;
  color: #4A5F5A;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #0F7A70;
  box-shadow: 0 0 0 2px rgba(15, 122, 112, 0.25);
  animation: pulse-dot-anim 1.8s infinite;
}

@keyframes pulse-dot-anim {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.static-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #8C9E99;
}

/* Stylized Map Card */
.map-card {
  min-height: 380px;
  height: 100%;
  background-color: #EEF4EE;
  border: 1px solid #E0EAE2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.map-svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-overlay-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: auto;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #FFFFFF;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #D6E2DC;
  box-shadow: 0 2px 6px rgba(16, 49, 47, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
  color: #10312F;
}

.pin-circle {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.origin-circle {
  border: 2px solid #0F7A70;
  background-color: #FFFFFF;
}

.destination-circle {
  border: 2.5px solid #10312F;
  background-color: #FFFFFF;
}

/* Ambulance marker with glowing ring */
.ambulance-vehicle-badge {
  position: relative;
  width: 38px;
  height: 38px;
  background-color: #10312F;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.ambulance-vehicle-badge:hover {
  transform: scale(1.1);
}

.pulse-beacon {
  position: absolute;
  inset: -6px;
  border-radius: 14px;
  border: 2px solid #0F7A70;
  animation: beacon-pulse 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
  pointer-events: none;
}

@keyframes beacon-pulse {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

.map-hud-bar {
  position: relative;
  z-index: 3;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border-top: 1px solid rgba(220, 231, 224, 0.8);
}

.hud-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  color: #5A706A;
  font-weight: 500;
}

/* 2x2 Metric Cards */
.metric-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 92px;
  border: 1px solid #E8E6DF;
}

.metric-label {
  font-size: 0.72rem;
  color: #5A706A;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.55rem;
  color: #10312F;
  letter-spacing: -0.02em;
}

/* Chart Summary Card */
.chart-summary-card {
  min-height: 175px;
  border: 1px solid #E8E6DF;
}

.chart-card-title {
  font-size: 0.85rem;
  color: #10312F;
}

.badge-en-rango {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  background-color: #EBF7EE;
  border-radius: 9999px;
  color: #1E6B38;
  font-size: 0.68rem;
  font-weight: 600;
}

.badge-en-rango .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #22C55E;
}

.chart-wrapper {
  flex: 1;
  width: 100%;
}
</style>
