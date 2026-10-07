<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Component displaying an individual SmartBox container card in the catalog grid.
 * Conforms to Medical SMARTBOX design system (MBA-29).
 */
const props = defineProps({
  container: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'unlink']);
const router = useRouter();

const isOnline = computed(() => props.container.status !== 'offline');

const statusBadgeClass = computed(() => {
  if (props.container.status === 'offline') return 'badge-offline';
  if (props.container.currentTemperature > props.container.targetMaxTemperature || props.container.status === 'warning') return 'badge-critical';
  if (!props.container.ambulancePlate || props.container.status === 'unlinked') return 'badge-available';
  return 'badge-stable';
});

const statusLabel = computed(() => {
  if (props.container.status === 'offline') return 'Desconectado';
  if (props.container.currentTemperature > props.container.targetMaxTemperature || props.container.status === 'warning') return 'Crítica';
  if (!props.container.ambulancePlate || props.container.status === 'unlinked') return 'Disponible';
  return 'Estable';
});

const batteryLevelClass = computed(() => {
  if (props.container.batteryLevel <= 20) return 'bg-red-500';
  if (props.container.batteryLevel <= 40) return 'bg-amber-500';
  return 'bg-emerald-600';
});

function handleCardClick() {
  emit('select', props.container);
}

function navigateToLive(e) {
  e.stopPropagation();
  router.push('/telemetry/live');
}
</script>

<template>
  <div
    class="container-card p-3 md:p-4 border-round-2xl cursor-pointer transition-all transition-duration-200"
    :class="{ 'card-selected': isSelected }"
    tabindex="0"
    role="button"
    :aria-label="`SmartBox ${container.id}`"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
  >
    <!-- Header: ID + Connectivity Tag -->
    <div class="flex justify-content-between align-items-center mb-3">
      <div class="flex align-items-center gap-2">
        <div class="box-icon-wrap flex align-items-center justify-content-center border-round-lg">
          <i class="pi pi-box text-sm"></i>
        </div>
        <div>
          <h3 class="box-id text-base font-bold m-0">{{ container.id }}</h3>
          <span class="box-model text-xs">{{ container.model || 'Standard SmartBox 20L' }}</span>
        </div>
      </div>

      <!-- Connectivity pill -->
      <span
        class="connectivity-tag text-xs font-semibold px-2 py-1 border-round-pill flex align-items-center gap-1"
        :class="isOnline ? 'conn-online' : 'conn-offline'"
      >
        <span class="status-dot" :class="isOnline ? 'dot-online' : 'dot-offline'"></span>
        {{ isOnline ? 'En línea' : 'Sin conexión' }}
      </span>
    </div>

    <!-- Metrics Row: Temp, Battery, Ambulance -->
    <div class="metrics-grid grid mb-3">
      <!-- Temperature -->
      <div class="col-4 p-1">
        <div class="metric-mini p-2 border-round-xl">
          <span class="metric-label block text-xs">Temp.</span>
          <div class="metric-val text-sm md:text-base font-bold mt-1">
            {{ isOnline ? `${container.currentTemperature.toFixed(1).replace('.', ',')} °C` : '—' }}
          </div>
          <span
            v-if="isOnline"
            class="temp-chip text-2xs px-1 border-round mt-1 inline-block"
            :class="container.isTemperatureInSafeRange ? 'temp-safe' : 'temp-warn'"
          >
            {{ container.isTemperatureInSafeRange ? '2-8 °C' : 'Alerta' }}
          </span>
        </div>
      </div>

      <!-- Battery -->
      <div class="col-4 p-1">
        <div class="metric-mini p-2 border-round-xl">
          <span class="metric-label block text-xs">Batería</span>
          <div class="metric-val text-sm md:text-base font-bold mt-1">
            {{ container.batteryLevel }}%
          </div>
          <div class="battery-track mt-1 w-full border-round-pill">
            <div
              class="battery-fill border-round-pill"
              :class="batteryLevelClass"
              :style="{ width: `${Math.min(100, Math.max(5, container.batteryLevel))}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Ambulance -->
      <div class="col-4 p-1">
        <div class="metric-mini p-2 border-round-xl">
          <span class="metric-label block text-xs">Ambulancia</span>
          <div class="metric-val text-sm md:text-base font-bold mt-1 text-truncate">
            {{ container.ambulancePlate || '—' }}
          </div>
          <span class="text-2xs text-muted block mt-1 text-truncate">
            {{ container.location ? container.location.split(' ')[0] : 'Base' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer: Status Pill + Actions -->
    <div class="flex justify-content-between align-items-center pt-2 border-top-subtle">
      <span
        class="state-badge text-xs font-semibold px-2 py-1 border-round-pill flex align-items-center gap-1"
        :class="statusBadgeClass"
      >
        <span class="dot-sm"></span>
        {{ statusLabel }}
      </span>

      <div class="flex align-items-center gap-2">
        <pv-button
          v-tooltip.top="'Supervisión telemétrica continua'"
          icon="pi pi-chart-line"
          label="En vivo"
          size="small"
          text
          class="p-button-live text-xs"
          @click="navigateToLive"
        />
        <pv-button
          icon="pi pi-arrow-right"
          rounded
          text
          size="small"
          class="p-button-arrow"
          @click="handleCardClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.container-card:hover {
  border-color: #0F7A70;
  box-shadow: 0 4px 12px rgba(15, 122, 112, 0.08);
  transform: translateY(-1px);
}

.card-selected {
  border-color: #0F7A70 !important;
  background-color: #F8FAF9;
  box-shadow: 0 0 0 2px rgba(15, 122, 112, 0.15) !important;
}

.box-icon-wrap {
  width: 32px;
  height: 32px;
  background-color: #EBF8F2;
  color: #0F7A70;
}

.box-id {
  color: #10312F;
}

.box-model {
  color: #5A706A;
}

.connectivity-tag {
  line-height: 1;
}

.conn-online {
  background-color: #E6F4EA;
  color: #137333;
}

.conn-offline {
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

.metric-mini {
  background-color: #F8F9F8;
  border: 1px solid #ECEEEB;
}

.metric-label {
  color: #5A706A;
  font-size: 0.72rem;
}

.metric-val {
  color: #10312F;
}

.battery-track {
  height: 4px;
  background-color: #E2E8F0;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.temp-chip {
  font-size: 0.65rem;
}

.temp-safe {
  background-color: #E6F4EA;
  color: #137333;
}

.temp-warn {
  background-color: #FCE8E6;
  color: #C5221F;
}

.border-top-subtle {
  border-top: 1px solid #F0EFEA;
}

.state-badge {
  line-height: 1;
}

.badge-stable {
  background-color: #E6F4EA;
  color: #137333;
}
.badge-stable .dot-sm {
  background-color: #137333;
}

.badge-critical {
  background-color: #FCE8E6;
  color: #C5221F;
}
.badge-critical .dot-sm {
  background-color: #C5221F;
}

.badge-available {
  background-color: #E3F2FD;
  color: #1565C0;
}
.badge-available .dot-sm {
  background-color: #1565C0;
}

.badge-offline {
  background-color: #F1F3F4;
  color: #5F6368;
}
.badge-offline .dot-sm {
  background-color: #5F6368;
}

.dot-sm {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.p-button-live {
  color: #0F7A70 !important;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
}

.p-button-arrow {
  color: #5A706A !important;
  width: 28px;
  height: 28px;
}

.text-2xs {
  font-size: 0.65rem;
}
</style>
