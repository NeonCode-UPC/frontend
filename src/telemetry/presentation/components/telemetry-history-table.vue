<script setup>
import { computed, ref } from 'vue';
import TelemetryChart from './telemetry-chart.vue';

const props = defineProps({
  containerId: {
    type: String,
    default: 'SB-0182'
  },
  transferId: {
    type: String,
    default: 'TR-0417'
  },
  logs: {
    type: Array,
    default: () => []
  }
});

// Time range window: '6h' | '12h' | '24h'
const selectedWindow = ref('6h');
const timeWindows = [
  { label: '6 h', value: '6h', count: 7 },
  { label: '12 h', value: '12h', count: 14 },
  { label: '24 h', value: '24h', count: 24 }
];

// Fallback mock logs if store logs are empty
const defaultLogs = [
  { id: '1', time: '13:40', temperature: 4.2, netWeight: 18.4, batteryLevel: 82, lidStatus: 'closed' },
  { id: '2', time: '13:30', temperature: 4.5, netWeight: 18.4, batteryLevel: 83, lidStatus: 'closed' },
  { id: '3', time: '13:20', temperature: 4.9, netWeight: 18.4, batteryLevel: 83, lidStatus: 'closed' },
  { id: '4', time: '13:10', temperature: 4.4, netWeight: 19.2, batteryLevel: 84, lidStatus: 'closed' },
  { id: '5', time: '13:00', temperature: 4.2, netWeight: 19.2, batteryLevel: 84, lidStatus: 'closed' },
  { id: '6', time: '12:50', temperature: 4.0, netWeight: 19.2, batteryLevel: 85, lidStatus: 'closed' },
  { id: '7', time: '12:40', temperature: 3.9, netWeight: 19.2, batteryLevel: 85, lidStatus: 'closed' },
  { id: '8', time: '12:30', temperature: 4.1, netWeight: 19.2, batteryLevel: 86, lidStatus: 'closed' },
  { id: '9', time: '12:20', temperature: 4.5, netWeight: 19.2, batteryLevel: 86, lidStatus: 'open' },
  { id: '10', time: '12:10', temperature: 4.3, netWeight: 16.8, batteryLevel: 87, lidStatus: 'closed' },
  { id: '11', time: '12:00', temperature: 4.2, netWeight: 16.8, batteryLevel: 87, lidStatus: 'closed' },
  { id: '12', time: '11:50', temperature: 4.1, netWeight: 16.8, batteryLevel: 88, lidStatus: 'closed' },
  { id: '13', time: '11:40', temperature: 4.0, netWeight: 16.8, batteryLevel: 88, lidStatus: 'closed' },
  { id: '14', time: '11:30', temperature: 4.2, netWeight: 16.8, batteryLevel: 89, lidStatus: 'closed' },
  { id: '15', time: '11:20', temperature: 4.3, netWeight: 16.8, batteryLevel: 89, lidStatus: 'closed' },
  { id: '16', time: '11:10', temperature: 4.6, netWeight: 16.8, batteryLevel: 90, lidStatus: 'open' },
  { id: '17', time: '11:00', temperature: 4.2, netWeight: 17.6, batteryLevel: 90, lidStatus: 'closed' },
  { id: '18', time: '10:30', temperature: 4.1, netWeight: 17.6, batteryLevel: 91, lidStatus: 'closed' },
  { id: '19', time: '10:00', temperature: 4.0, netWeight: 17.6, batteryLevel: 92, lidStatus: 'closed' },
  { id: '20', time: '09:30', temperature: 4.1, netWeight: 17.6, batteryLevel: 93, lidStatus: 'closed' },
  { id: '21', time: '09:00', temperature: 4.2, netWeight: 17.6, batteryLevel: 94, lidStatus: 'closed' },
  { id: '22', time: '08:30', temperature: 4.3, netWeight: 17.6, batteryLevel: 95, lidStatus: 'closed' },
  { id: '23', time: '08:05', temperature: 4.2, netWeight: 17.6, batteryLevel: 96, lidStatus: 'closed' }
];

// Active source logs
const sourceLogs = computed(() => {
  return (props.logs && props.logs.length > 0) ? props.logs : defaultLogs;
});

// Logs filtered according to the selected window
const filteredLogs = computed(() => {
  const currentCount = timeWindows.find(w => w.value === selectedWindow.value)?.count || 7;
  return sourceLogs.value.slice(0, currentCount);
});

// Chronological logs for chart rendering
const chartLogs = computed(() => {
  return [...filteredLogs.value].reverse();
});

function formatTemp(value) {
  if (value == null) return '--';
  return `${Number(value).toFixed(1).replace('.', ',')} °C`;
}

function formatWeight(value) {
  if (value == null) return '--';
  return `${Number(value).toFixed(1).replace('.', ',')} kg`;
}

function formatBattery(value) {
  if (value == null) return '--';
  return `${Math.round(value)} %`;
}
</script>

<template>
  <div class="telemetry-history-table flex flex-column gap-3">
    <!-- Header: Title, Subtitle and Time Window Pills (MBA-53) -->
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          Telemetría / <strong>{{ containerId }}</strong>
        </div>
        <h1 class="screen-title m-0">
          Telemetría {{ containerId }}
        </h1>
        <p class="subtitle-text m-0 mt-1">
          Historial del traslado {{ transferId }}
        </p>
      </div>

      <!-- Time Window Selectors (6 h · 12 h · 24 h) -->
      <pill-tabs
        v-model="selectedWindow"
        :options="timeWindows"
        size="sm"
      />
    </div>

    <!-- Continuous Temperature Chart Card (MBA-53) -->
    <div class="chart-card screen-card border-round-2xl p-4">
      <div class="flex align-items-center justify-content-between mb-3">
        <span class="chart-title font-bold">Temperatura</span>
        <span class="range-sublabel">Rango 2–8 °C</span>
      </div>

      <div class="chart-container">
        <telemetry-chart
          :data="chartLogs"
          :height="130"
          :interactive="true"
        />
      </div>
    </div>

    <!-- Telemetric History Data Table Card (MBA-53) -->
    <div class="table-card screen-card border-round-2xl p-0 overflow-hidden">
      <app-data-table
        :value="filteredLogs"
        :paginator="false"
        min-width="35rem"
      >
        <!-- Columna: HORA -->
        <pv-column field="time" header="HORA">
          <template #body="{ data }">
            <span class="table-cell-bold">{{ data.time }}</span>
          </template>
        </pv-column>

        <!-- Columna: TEMPERATURA -->
        <pv-column field="temperature" header="TEMPERATURA">
          <template #body="{ data }">
            <span class="table-cell-regular">{{ formatTemp(data.temperature) }}</span>
          </template>
        </pv-column>

        <!-- Columna: PESO -->
        <pv-column field="netWeight" header="PESO">
          <template #body="{ data }">
            <span class="table-cell-regular">{{ formatWeight(data.netWeight) }}</span>
          </template>
        </pv-column>

        <!-- Columna: BATERÍA -->
        <pv-column field="batteryLevel" header="BATERÍA">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <battery-gauge :level="data.batteryLevel" variant="capsule" />
              <span class="text-xs font-semibold text-main">{{ formatBattery(data.batteryLevel) }}</span>
            </div>
          </template>
        </pv-column>

        <!-- Columna: TAPA -->
        <pv-column field="lidStatus" header="TAPA">
          <template #body="{ data }">
            <status-badge
              :status="data.lidStatus === 'closed' ? 'success' : 'warning'"
              :label="data.lidStatus === 'closed' ? 'Cerrada' : 'Abierta'"
            />
          </template>
        </pv-column>
      </app-data-table>
    </div>
  </div>
</template>

<style scoped>
.telemetry-history-table {
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

/* Time Pills */
.time-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background-color: #FFFFFF;
  border: 1px solid #DCE3E0;
  color: #5A706A;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.time-pill:hover {
  background-color: #F8FAF9;
  border-color: #B8CBC6;
}

.time-pill.active {
  border: 1.5px solid #10312F;
  color: #10312F;
  font-weight: 700;
}

.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #8C9E99;
}

.time-pill.active .pill-dot {
  background-color: #10312F;
}

/* Chart Card */
.chart-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.chart-title {
  font-size: 0.92rem;
  color: #10312F;
}

.range-sublabel {
  font-size: 0.74rem;
  color: #5A706A;
}

/* Table Card */
.table-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

:deep(.custom-history-table) {
  border: none;
}

:deep(.custom-history-table .p-datatable-header) {
  background: transparent;
  border: none;
}

:deep(.custom-history-table .p-datatable-thead > tr > th) {
  background: #FFFFFF;
  border-bottom: 1px solid #ECEAE1;
  color: #8C9E99;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.85rem 1rem;
}

:deep(.custom-history-table .p-datatable-tbody > tr) {
  background: #FFFFFF;
  transition: background-color 0.12s ease;
}

:deep(.custom-history-table .p-datatable-tbody > tr:hover) {
  background: #F9FAF8;
}

:deep(.custom-history-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #F1EFEA;
  padding: 0.9rem 1rem;
  font-size: 0.82rem;
  color: #10312F;
}

.table-cell-bold {
  font-weight: 700;
  color: #10312F;
}

.table-cell-regular {
  font-weight: 500;
  color: #10312F;
}

/* Lid Status Badge */
.lid-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 600;
}

.lid-closed {
  background-color: #EBF7EE;
  color: #1E6B38;
}

.lid-closed .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #22C55E;
}

.lid-open {
  background-color: #FDF3E7;
  color: #E89332;
}

.lid-open .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #E89332;
}
</style>
