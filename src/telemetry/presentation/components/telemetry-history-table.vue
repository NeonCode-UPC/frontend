<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ThermalThresholds } from '../../domain/thermal-thresholds.value-object.js';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';
import TelemetryChart from './telemetry-chart.vue';

const props = defineProps({
  containerId: {
    type: String,
    required: true
  },
  transferId: {
    type: String,
    default: ''
  },
  thresholds: {
    type: Object,
    default: () => new ThermalThresholds()
  },
  logs: {
    type: Array,
    default: () => []
  }
});

const { t } = useI18n();
const { formatNumber, formatTemperature, formatKilograms } = useTelemetryFormat();

// Time range window: '6h' | '12h' | '24h' (number of most recent readings shown)
const selectedWindow = ref('6h');
const timeWindows = [
  { label: '6 h', value: '6h', readings: 7 },
  { label: '12 h', value: '12h', readings: 14 },
  { label: '24 h', value: '24h', readings: 24 }
];

// Logs of this container, newest first
const sourceLogs = computed(() => props.logs
  .filter(log => log.containerId === props.containerId)
  .slice()
  .sort((a, b) => String(b.timestampUtc).localeCompare(String(a.timestampUtc))));

// Logs filtered according to the selected window
const filteredLogs = computed(() => {
  const currentCount = timeWindows.find(w => w.value === selectedWindow.value)?.readings || 7;
  return sourceLogs.value.slice(0, currentCount);
});

// Chronological logs for chart rendering
const chartLogs = computed(() => [...filteredLogs.value].reverse());

const rangeLabel = computed(() =>
  t('telemetry.history.range', { min: formatNumber(props.thresholds.minCelsius), max: formatTemperature(props.thresholds.maxCelsius) }));
</script>

<template>
  <div class="telemetry-history-table flex flex-column gap-3">
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          {{ t('telemetry.live.breadcrumb') }} / <strong>{{ containerId }}</strong>
        </div>
        <h1 class="screen-title m-0">
          {{ t('telemetry.history.title', { id: containerId }) }}
        </h1>
        <p class="subtitle-text m-0 mt-1">
          {{ transferId ? t('telemetry.history.subtitle', { transfer: transferId }) : t('telemetry.history.subtitle-no-transfer') }}
        </p>
      </div>

      <pill-tabs
        v-model="selectedWindow"
        :options="timeWindows"
        size="sm"
        :aria-label="t('telemetry.history.window-label')"
      />
    </div>

    <section class="chart-card screen-card border-round-2xl p-4" :aria-label="t('telemetry.history.chart-title')">
      <div class="flex align-items-center justify-content-between mb-3">
        <span class="chart-title font-bold">{{ t('telemetry.history.chart-title') }}</span>
        <span class="range-sublabel">{{ rangeLabel }}</span>
      </div>

      <div class="chart-container">
        <telemetry-chart
          :data="chartLogs"
          :height="130"
          :safe-min="thresholds.minCelsius"
          :safe-max="thresholds.maxCelsius"
          :interactive="true"
        />
      </div>
    </section>

    <p v-if="!filteredLogs.length" class="text-xs text-muted m-0" role="status">{{ t('telemetry.history.empty') }}</p>

    <app-data-table
      v-else
      :value="filteredLogs"
      :paginator="false"
      min-width="35rem"
      :aria-label="t('telemetry.history.table-label', { id: containerId })"
    >
      <pv-column field="time" :header="t('telemetry.column.time')">
        <template #body="{ data }">
          <span class="table-cell-bold">{{ data.time }}</span>
        </template>
      </pv-column>

      <pv-column field="temperature" :header="t('telemetry.column.temperature')">
        <template #body="{ data }">
          <span class="table-cell-regular">{{ formatTemperature(data.temperature) }}</span>
        </template>
      </pv-column>

      <pv-column field="netWeight" :header="t('telemetry.column.weight')">
        <template #body="{ data }">
          <span class="table-cell-regular">{{ formatKilograms(data.netWeight) }}</span>
        </template>
      </pv-column>

      <pv-column field="batteryLevel" :header="t('telemetry.column.battery')">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <battery-gauge :level="data.batteryLevel" variant="capsule" />
            <span class="text-xs font-semibold text-main">{{ Math.round(data.batteryLevel) }} %</span>
          </div>
        </template>
      </pv-column>

      <pv-column field="lidStatus" :header="t('telemetry.column.lid')">
        <template #body="{ data }">
          <status-badge
            :status="data.lidStatus === 'closed' ? 'success' : 'warning'"
            :label="t(`telemetry.lid.${data.lidStatus}`)"
          />
        </template>
      </pv-column>
    </app-data-table>
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
