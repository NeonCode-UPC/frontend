<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useTelemetryStore } from '../../application/telemetry.store.js';
import { TelemetryLog } from '../../domain/telemetry-log.entity.js';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';

// Subcomponents matching Figma designs
import LiveGaugeMonitor from '../components/live-gauge-monitor.vue';
import ThermalExcursionAlert from '../components/thermal-excursion-alert.vue';
import TelemetryHistoryTable from '../components/telemetry-history-table.vue';
import OfflineStateBanner from '../components/offline-state-banner.vue';

const store = useTelemetryStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const { formatTemperature } = useTelemetryFormat();

// Active Figma screen view mode: 'live' (MBA-49) | 'excursion' (MBA-50) | 'history' (MBA-53) | 'offline' (MBA-54)
const activeViewMode = ref('live');

// Active container selection
const selectedContainerId = ref(null);

// Excursion simulation (demo without hardware) and acknowledgement state
const isSimulatedExcursion = ref(false);
const simulatedAt = ref(null);
const isAcknowledged = ref(false);

// Acknowledge dialog
const showAcknowledgeDialog = ref(false);
const acknowledgeNote = ref('');
const isAcknowledging = ref(false);

onMounted(async () => {
  await store.fetchContainers();
  const queryMatch = route.query.container ? store.findContainer(route.query.container) : null;
  selectedContainerId.value = queryMatch?.id ?? store.selectedContainer?.id ?? store.containers[0]?.id ?? null;
});

const baseContainer = computed(() => store.findContainer(selectedContainerId.value) || null);

// Current container, with a simulated reading above the upper threshold when the simulation is on
const currentContainer = computed(() => {
  const target = baseContainer.value;
  if (!target) return null;
  if (!isSimulatedExcursion.value) return target;
  return target.withTemperature(Number((target.thermalThresholds.maxCelsius + 1.2).toFixed(1)));
});

const offlineContainer = computed(() => store.containers.find(c => c.status === 'offline') || null);

const excursionStartedAt = computed(() => {
  if (isSimulatedExcursion.value) return simulatedAt.value;
  const firstOut = store.telemetryLogs.find(log => currentContainer.value?.ownsTelemetryLog(log) && log.isThermalExcursion);
  return firstOut?.timestampUtc || null;
});

const viewModes = computed(() => [
  { value: 'live', icon: 'pi pi-compass', label: t('telemetry.live.mode-live') },
  { value: 'excursion', icon: 'pi pi-exclamation-triangle', label: t('telemetry.live.mode-excursion') },
  { value: 'history', icon: 'pi pi-history', label: t('telemetry.live.mode-history') },
  { value: 'offline', icon: 'pi pi-wifi', label: t('telemetry.live.mode-connection') }
]);

// React to container change
watch(selectedContainerId, async (newId) => {
  if (newId === null || newId === undefined || newId === '') return;
  isSimulatedExcursion.value = false;
  isAcknowledged.value = false;
  await store.fetchTelemetryLogs(newId);
  const cont = store.findContainer(newId);
  if (cont?.status === 'offline') {
    activeViewMode.value = 'offline';
  } else if (cont?.thermalState === 'critical') {
    activeViewMode.value = 'excursion';
  }
});

function toggleExcursionSimulation() {
  if (!baseContainer.value) return;
  isSimulatedExcursion.value = !isSimulatedExcursion.value;
  isAcknowledged.value = false;
  if (isSimulatedExcursion.value) {
    simulatedAt.value = TelemetryLog.currentTimestamp();
    activeViewMode.value = 'excursion';
    toast.add({
      severity: 'error',
      summary: t('telemetry.toast.excursion-summary'),
      detail: t('telemetry.toast.excursion-detail', {
        id: currentContainer.value.displayCode,
        temp: formatTemperature(currentContainer.value.currentTemperature)
      }),
      life: 5000
    });
  } else {
    activeViewMode.value = 'live';
    toast.add({
      severity: 'success',
      summary: t('telemetry.toast.stabilized-summary'),
      detail: t('telemetry.toast.stabilized-detail', {
        id: baseContainer.value.displayCode,
        temp: formatTemperature(baseContainer.value.currentTemperature)
      }),
      life: 3500
    });
  }
}

function confirmAcknowledge() {
  isAcknowledging.value = true;
  setTimeout(() => {
    isAcknowledging.value = false;
    isAcknowledged.value = true;
    showAcknowledgeDialog.value = false;
    toast.add({
      severity: 'success',
      summary: t('telemetry.toast.acknowledged-summary'),
      detail: acknowledgeNote.value.trim() || t('telemetry.toast.acknowledged-detail'),
      life: 4000
    });
    acknowledgeNote.value = '';
  }, 500);
}

function handleRetryConnection() {
  toast.add({
    severity: 'info',
    summary: t('telemetry.toast.retry-summary'),
    detail: t('telemetry.toast.retry-detail', { id: offlineContainer.value?.displayCode || offlineContainer.value?.id }),
    life: 3000
  });
  store.fetchContainers();
}
</script>

<template>
  <div class="live-telemetry-view flex flex-column gap-3">
    <!-- View Switcher, container selector & simulation -->
    <div class="view-control-toolbar screen-card border-round-xl p-2 px-3 flex flex-column sm:flex-row align-items-center justify-content-between gap-3">
      <div class="mode-tabs-container flex align-items-center gap-1 overflow-x-auto w-full sm:w-auto" role="tablist" :aria-label="t('telemetry.live.modes-label')">
        <button
          v-for="mode in viewModes"
          :key="mode.value"
          type="button"
          role="tab"
          :aria-selected="activeViewMode === mode.value"
          class="mode-tab-btn"
          :class="{ active: activeViewMode === mode.value, 'has-danger': mode.value === 'excursion' && isSimulatedExcursion }"
          @click="activeViewMode = mode.value"
        >
          <i :class="[mode.icon, 'text-xs', mode.value === 'excursion' ? 'text-red-500' : '']" aria-hidden="true"></i>
          <span>{{ mode.label }}</span>
        </button>
      </div>

      <div class="simulation-actions flex align-items-center gap-2 w-full sm:w-auto justify-content-end">
        <label for="live-container-select" class="sr-only">{{ t('telemetry.live.select-container') }}</label>
        <pv-select
          v-model="selectedContainerId"
          input-id="live-container-select"
          :options="store.containers"
          option-label="displayCode"
          option-value="id"
          :placeholder="t('telemetry.live.select-container')"
          class="text-xs"
        />
        <pv-button
          :class="isSimulatedExcursion ? 'sim-btn-active' : 'sim-btn-idle'"
          class="p-button-sm border-round-3xl text-xs py-1 px-3"
          :disabled="!baseContainer"
          :aria-pressed="isSimulatedExcursion"
          @click="toggleExcursionSimulation"
        >
          <i :class="isSimulatedExcursion ? 'pi pi-bell-slash' : 'pi pi-bolt'" class="text-xs mr-1" aria-hidden="true"></i>
          <span>{{ isSimulatedExcursion ? t('telemetry.live.stop-simulation') : t('telemetry.live.simulate') }}</span>
        </pv-button>
      </div>
    </div>

    <div
      v-if="!currentContainer"
      class="screen-card border-round-xl p-4 flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3 text-xs text-muted"
      role="status"
      aria-live="polite"
    >
      <span>
        {{ store.loading ? t('telemetry.catalog.loading') : (store.containers.length === 0 ? t('telemetry.catalog.empty-catalog') : t('telemetry.catalog.empty')) }}
      </span>
      <pv-button
        v-if="!store.loading && store.containers.length === 0"
        :label="t('telemetry.live.go-to-catalog')"
        icon="pi pi-plus"
        class="p-button-sm border-round-pill text-xs font-semibold align-self-start sm:align-self-auto"
        @click="router.push('/telemetry')"
      />
    </div>

    <div v-else class="view-content-canvas">
      <!-- MBA-49: Live monitor -->
      <live-gauge-monitor
        v-if="activeViewMode === 'live'"
        :container="currentContainer"
        :logs="store.telemetryLogs"
      />

      <!-- MBA-50: Thermal excursion -->
      <thermal-excursion-alert
        v-else-if="activeViewMode === 'excursion'"
        :container="currentContainer"
        :logs="store.telemetryLogs"
        :excursion-started-at="excursionStartedAt"
        :acknowledged="isAcknowledged"
        @acknowledge="showAcknowledgeDialog = true"
        @view-incident="router.push('/alerting')"
        @view-transfer="router.push('/transport')"
      />

      <!-- MBA-53: History -->
      <telemetry-history-table
        v-else-if="activeViewMode === 'history'"
        :container="currentContainer"
        :container-id="currentContainer.displayCode"
        :transfer-id="currentContainer.currentTransferId || ''"
        :thresholds="currentContainer.thermalThresholds"
        :logs="store.telemetryLogs"
      />

      <!-- MBA-54: Connection states -->
      <offline-state-banner
        v-else-if="activeViewMode === 'offline'"
        :container-id="currentContainer.displayCode"
        :offline-container="offlineContainer"
        :last-reading-at="currentContainer.lastTelemetryAt"
        mode="gallery"
        @retry="handleRetryConnection"
      />
    </div>

    <!-- Acknowledge thermal excursion -->
    <pv-dialog
      v-model:visible="showAcknowledgeDialog"
      modal
      :header="t('telemetry.acknowledge.title')"
      :style="{ width: 'min(92vw, 480px)' }"
    >
      <div v-if="currentContainer" class="flex flex-column gap-3">
        <div class="p-3 border-round-xl bg-red-50 border-1 border-red-200 text-xs" role="alert">
          <strong class="text-red-700 block mb-1">{{ t('telemetry.acknowledge.box', { id: currentContainer.displayCode }) }}</strong>
          <span class="text-red-600">
            {{ t('telemetry.acknowledge.detail', {
              temp: formatTemperature(currentContainer.currentTemperature),
              max: formatTemperature(currentContainer.thermalThresholds.maxCelsius)
            }) }}
          </span>
        </div>

        <div>
          <label for="acknowledge-note" class="block text-xs font-bold text-main mb-1">{{ t('telemetry.acknowledge.note') }}</label>
          <pv-textarea
            id="acknowledge-note"
            v-model="acknowledgeNote"
            rows="3"
            class="w-full text-xs"
            :placeholder="t('telemetry.acknowledge.placeholder')"
          />
        </div>
      </div>

      <template #footer>
        <pv-button :label="t('telemetry.action.cancel')" severity="secondary" text @click="showAcknowledgeDialog = false" />
        <pv-button
          :label="t('telemetry.acknowledge.confirm')"
          class="btn-confirm-ack"
          :loading="isAcknowledging"
          @click="confirmAcknowledge"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.live-telemetry-view {
  width: 100%;
}

/* View Mode Selector Toolbar */
.view-control-toolbar {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.mode-tabs-container {
  scrollbar-width: none;
}

.mode-tabs-container::-webkit-scrollbar {
  display: none;
}

.mode-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  color: #5A706A;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.mode-tab-btn:hover {
  background-color: #F6F8F7;
  color: #10312F;
}

.mode-tab-btn.active {
  background-color: #10312F;
  color: #FFFFFF;
  border-color: #10312F;
}

.mode-tab-btn.active i {
  color: #B9DDA0 !important;
}

.mode-tab-btn.has-danger.active {
  background-color: #E05A46 !important;
  border-color: #E05A46 !important;
}

.mode-tab-btn.has-danger.active i {
  color: #FFFFFF !important;
}

/* Simulation Button */
.sim-btn-idle {
  background-color: #F5FAF6 !important;
  color: #0F7A70 !important;
  border: 1px solid #C8E3D5 !important;
}

.sim-btn-active {
  background-color: #FDF2F0 !important;
  color: #E05A46 !important;
  border: 1px solid #F9D0CB !important;
}

.view-content-canvas {
  width: 100%;
}

/* Dialog Action Buttons */
.btn-confirm-ack {
  background-color: #10312F !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 9999px !important;
  font-size: 0.75rem !important;
  padding: 0.45rem 1rem !important;
}

.btn-call-cabin {
  background-color: #0F7A70 !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 9999px !important;
  font-size: 0.75rem !important;
  padding: 0.45rem 1rem !important;
}

/* Visually hidden label (accessible name for the container selector) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
