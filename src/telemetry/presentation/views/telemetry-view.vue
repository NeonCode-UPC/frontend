<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useTelemetryStore } from '../../application/telemetry.store.js';
import { RecordWeightWithdrawalCommand } from '../../domain/record-weight-withdrawal.command.js';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';
import ContainerCard from '../components/container-card.vue';
import ContainerDetailPanel from '../components/container-detail-panel.vue';
import StockWeightModal from '../components/stock-weight-modal.vue';
import LinkContainerWizard from '../components/link-container-wizard.vue';

/**
 * Main SmartBox management view (/telemetry).
 * Faithful implementation of Figma designs MBA-29, MBA-30, MBA-51, MBA-52, MBA-33, MBA-34, MBA-35.
 */

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const { searchQuery, configureHeader } = useLayoutHeader();
const telemetryStore = useTelemetryStore();
const { formatTemperature, containerState } = useTelemetryFormat();

// View layout: 'list' (catalog) or 'detail' (single container inspection)
const currentMode = ref('list');

// Catalog display format: 'table' (MBA-29) or 'grid' (cards)
const displayFormat = ref('table');

// Filter: 'all' | 'online' | 'offline' | 'en-route'
const activeFilter = ref('all');

// Modals state
const isLinkWizardVisible = ref(false);
const isWeightModalVisible = ref(false);
const targetWeightContainer = ref(null);

onMounted(async () => {
  configureHeader({
    placeholder: t('telemetry.catalog.search-placeholder'),
    visible: true
  });
  await telemetryStore.fetchContainers();

  // If query specifies container, open its detail immediately
  if (route.query.container) {
    const found = telemetryStore.findContainer(route.query.container);
    if (found) {
      telemetryStore.selectContainer(found);
      currentMode.value = 'detail';
    }
  }
});

// Watch route query changes
watch(() => route.query.container, (newId) => {
  if (newId) {
    const found = telemetryStore.findContainer(newId);
    if (found) {
      telemetryStore.selectContainer(found);
      currentMode.value = 'detail';
    }
  } else {
    currentMode.value = 'list';
  }
});

// Filtered containers
const filteredContainers = computed(() => {
  let list = telemetryStore.containers;

  // Search filter
  const query = searchQuery.value?.trim().toLowerCase();
  if (query) {
    list = list.filter(c =>
      String(c.displayCode ?? '').toLowerCase().includes(query) ||
      String(c.id ?? '').toLowerCase().includes(query) ||
      String(c.serialNumber ?? '').toLowerCase().includes(query) ||
      c.ambulancePlate?.toLowerCase().includes(query) ||
      c.model?.toLowerCase().includes(query) ||
      c.location?.toLowerCase().includes(query) ||
      containerState(c).label.toLowerCase().includes(query)
    );
  }

  // Status tab filter
  if (activeFilter.value === 'online') {
    list = list.filter(c => c.status !== 'offline');
  } else if (activeFilter.value === 'offline') {
    list = list.filter(c => c.status === 'offline');
  } else if (activeFilter.value === 'en-route') {
    list = list.filter(c => Boolean(c.ambulancePlate));
  }

  return list;
});

// Counts for filter pills
const totalCount = computed(() => telemetryStore.containers.length);
const onlineCount = computed(() => telemetryStore.containers.filter(c => c.status !== 'offline').length);
const offlineCount = computed(() => telemetryStore.containers.filter(c => c.status === 'offline').length);
const enRouteCount = computed(() => telemetryStore.containers.filter(c => Boolean(c.ambulancePlate)).length);

const filterOptions = computed(() => [
  { label: t('telemetry.catalog.filter.all', { count: totalCount.value }), value: 'all' },
  { label: t('telemetry.catalog.filter.online', { count: onlineCount.value }), value: 'online' },
  { label: t('telemetry.catalog.filter.offline', { count: offlineCount.value }), value: 'offline' },
  { label: t('telemetry.catalog.filter.en-route', { count: enRouteCount.value }), value: 'en-route' }
]);

const formatOptions = computed(() => [
  { icon: 'pi pi-bars', value: 'table', label: '', ariaLabel: t('telemetry.catalog.view-table') },
  { icon: 'pi pi-th-large', value: 'grid', label: '', ariaLabel: t('telemetry.catalog.view-grid') }
]);

function selectContainerForDetail(container) {
  telemetryStore.selectContainer(container);
  currentMode.value = 'detail';
  router.push({ path: '/telemetry', query: { container: container.displayCode || container.id } });
}

function handleBackToList() {
  currentMode.value = 'list';
  router.push({ path: '/telemetry' });
}

function openWeightModal(container) {
  targetWeightContainer.value = container || telemetryStore.selectedContainer;
  isWeightModalVisible.value = true;
}

async function handleConfirmWithdrawal(payload) {
  try {
    await telemetryStore.recordWeightMovement(new RecordWeightWithdrawalCommand(payload));
    const displayId = telemetryStore.findContainer(payload.containerId)?.displayCode || payload.containerId;
    toast.add({
      severity: 'success',
      summary: t('telemetry.toast.withdrawal-summary'),
      detail: t('telemetry.toast.withdrawal-detail', { id: displayId }),
      life: 4000
    });
  } catch {
    toast.add({ severity: 'error', summary: t('telemetry.toast.error-summary'), detail: t('telemetry.toast.error-detail'), life: 4000 });
  }
}

function handleContainerLinked(payload) {
  const displayId = telemetryStore.findContainer(payload.containerId)?.displayCode || payload.containerId;
  toast.add({
    severity: 'success',
    summary: t('telemetry.toast.linked-summary'),
    detail: t('telemetry.toast.linked-detail', { id: displayId, plate: payload.ambulancePlate }),
    life: 4000
  });
  telemetryStore.fetchContainers();
}

const stateBadgeClass = {
  offline: 'state-offline',
  critical: 'state-critical',
  available: 'state-available',
  stable: 'state-stable'
};
</script>

<template>
  <div class="telemetry-view flex flex-column gap-4">
    <!-- ================= VIEW 1: CATALOG LIST (MBA-29) ================= -->
    <template v-if="currentMode === 'list'">
      <!-- Catalog Header -->
      <header class="catalog-header flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
        <div>
          <span class="breadcrumb-text text-xs text-muted block mb-1">{{ t('telemetry.name') }}</span>
          <h1 class="text-2xl md:text-3xl font-bold text-main m-0">{{ t('telemetry.name') }}</h1>
          <p class="subtitle text-xs text-muted mt-1 mb-0" role="status">
            {{ t('telemetry.catalog.summary', { total: totalCount, offline: offlineCount }) }}
          </p>
        </div>

        <!-- Action Button: Link container (MBA-29) -->
        <div class="header-action">
          <pv-button
            :label="t('telemetry.catalog.link-action')"
            icon="pi pi-link"
            class="btn-link-container px-4 py-2 text-xs border-round-pill font-bold shadow-1"
            @click="isLinkWizardVisible = true"
          />
        </div>
      </header>

      <!-- Filter Tabs & View Switcher Bar -->
      <div class="toolbar-panel flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3">
        <pill-tabs v-model="activeFilter" :options="filterOptions" :aria-label="t('telemetry.catalog.filter-label')" />

        <pill-tabs
          v-model="displayFormat"
          variant="segmented"
          :options="formatOptions"
          :aria-label="t('telemetry.catalog.view-label')"
        />
      </div>

      <!-- Loading / Empty states -->
      <div
        v-if="telemetryStore.loading && !filteredContainers.length"
        class="empty-state p-5 text-center text-muted"
        role="status"
        aria-live="polite"
      >
        <i class="pi pi-spin pi-spinner text-2xl text-teal mb-2" aria-hidden="true"></i>
        <p class="text-xs m-0">{{ t('telemetry.catalog.loading') }}</p>
      </div>

      <div
        v-else-if="!filteredContainers.length"
        class="empty-state p-5 text-center text-muted bg-white border-round-2xl border-subtle"
        role="status"
      >
        <i class="pi pi-info-circle text-2xl text-muted mb-2" aria-hidden="true"></i>
        <p class="text-sm font-semibold text-main m-0">{{ t('telemetry.catalog.empty') }}</p>
        <pv-button :label="t('telemetry.catalog.reset-filters')" text class="mt-2 text-xs" @click="activeFilter = 'all'" />
      </div>

      <!-- ================= OPTION A: TABLE VIEW (EXACT MBA-29) ================= -->
      <app-data-table
        v-else-if="displayFormat === 'table'"
        :value="filteredContainers"
        :paginator="false"
        min-width="45rem"
        :aria-label="t('telemetry.catalog.table-label')"
        @row-click="selectContainerForDetail($event.data)"
      >
        <pv-column field="displayCode" :header="t('telemetry.column.smartbox')">
          <template #body="{ data }">
            <span class="box-id-badge font-bold text-main">{{ data.displayCode }}</span>
          </template>
        </pv-column>

        <pv-column field="ambulancePlate" :header="t('telemetry.column.ambulance')">
          <template #body="{ data }">
            <span class="text-muted font-medium">{{ data.ambulancePlate || '—' }}</span>
          </template>
        </pv-column>

        <pv-column field="currentTemperature" :header="t('telemetry.column.temperature')">
          <template #body="{ data }">
            <span class="font-bold text-main">
              {{ data.status === 'offline' ? '—' : formatTemperature(data.currentTemperature) }}
            </span>
          </template>
        </pv-column>

        <pv-column field="batteryLevel" :header="t('telemetry.column.battery')">
          <template #body="{ data }">
            <battery-gauge :level="data.batteryLevel" variant="capsule" />
          </template>
        </pv-column>

        <pv-column :header="t('telemetry.column.connectivity')">
          <template #body="{ data }">
            <span
              class="tag-conn text-xs font-semibold px-3 py-1 border-round-pill inline-flex align-items-center gap-1"
              :class="data.status !== 'offline' ? 'conn-on' : 'conn-off'"
            >
              <span class="dot-indicator" :class="data.status !== 'offline' ? 'dot-green' : 'dot-gray'" aria-hidden="true"></span>
              {{ data.status !== 'offline' ? t('telemetry.connectivity.online') : t('telemetry.connectivity.offline') }}
            </span>
          </template>
        </pv-column>

        <pv-column :header="t('telemetry.column.state')">
          <template #body="{ data }">
            <span
              class="tag-state text-xs font-semibold px-3 py-1 border-round-pill inline-flex align-items-center gap-1"
              :class="stateBadgeClass[containerState(data).key]"
            >
              <span class="dot-indicator" aria-hidden="true"></span>
              {{ containerState(data).label }}
            </span>
          </template>
        </pv-column>
      </app-data-table>

      <!-- ================= OPTION B: GRID VIEW (CARDS) ================= -->
      <div v-else class="catalog-grid grid m-0 gap-3" role="list">
        <div
          v-for="c in filteredContainers"
          :key="c.id"
          class="col-12 sm:col-6 lg:col-4 xl:col-3 p-0"
          role="listitem"
        >
          <container-card
            :container="c"
            :is-selected="telemetryStore.selectedContainer?.id === c.id"
            @select="selectContainerForDetail"
          />
        </div>
      </div>
    </template>

    <!-- ================= VIEW 2: CONTAINER DETAIL (MBA-30 & MBA-51) ================= -->
    <template v-else-if="currentMode === 'detail' && telemetryStore.selectedContainer">
      <container-detail-panel
        :container="telemetryStore.selectedContainer"
        @back="handleBackToList"
        @open-withdrawal-modal="openWeightModal"
        @unlinked="handleBackToList"
      />
    </template>

    <!-- ================= MODALS & WIZARDS ================= -->

    <!-- Modal 1: Link Container Wizard (MBA-33, 34, 35) -->
    <link-container-wizard
      v-model:visible="isLinkWizardVisible"
      :preselected-container-id="telemetryStore.selectedContainer?.id ?? ''"
      @linked="handleContainerLinked"
    />

    <!-- Modal 2: Stock Weight Withdrawal Modal (MBA-52) -->
    <stock-weight-modal
      v-model:visible="isWeightModalVisible"
      :container="targetWeightContainer"
      @confirm="handleConfirmWithdrawal"
    />
  </div>
</template>

<style scoped>
.telemetry-view {
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

.btn-link-container {
  background-color: #0F7A70 !important;
  border: 1px solid #0F7A70 !important;
  color: #FFFFFF !important;
  box-shadow: 0 4px 12px rgba(15, 122, 112, 0.25);
  transition: all 0.2s ease;
}

.btn-link-container:hover {
  background-color: #0B5C55 !important;
  border-color: #0B5C55 !important;
}

.filter-pills {
  background-color: transparent;
}

.filter-btn {
  background-color: transparent;
  color: #5A706A;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #EAE8DE;
}

.filter-btn-active {
  background-color: #10312F !important;
  color: #FFFFFF !important;
}

.bg-switcher {
  background-color: #EAE8DE;
}

.switch-btn {
  background-color: transparent;
  color: #5A706A;
  transition: all 0.2s ease;
}

.switch-active {
  background-color: #FFFFFF;
  color: #10312F;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}


/* Battery Capsule */
.battery-indicator {
  width: 44px;
  height: 12px;
  background-color: #ECEEEB;
  border-radius: 6px;
  padding: 2px;
  position: relative;
  display: flex;
  align-items: center;
}

.battery-level {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bat-ok {
  background-color: #10B981;
}

.bat-warn {
  background-color: #F59E0B;
}

.bat-crit {
  background-color: #EF4444;
}

/* Connectivity Tags */
.tag-conn {
  line-height: 1.2;
}

.conn-on {
  background-color: #E6F4EA;
  color: #137333;
}

.conn-off {
  background-color: #F1F3F4;
  color: #5F6368;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-green {
  background-color: #137333;
}

.dot-gray {
  background-color: #5F6368;
}

/* State Tags */
.tag-state {
  line-height: 1.2;
}

.state-stable {
  background-color: #E6F4EA;
  color: #137333;
}
.state-stable .dot-indicator {
  background-color: #137333;
}

.state-critical {
  background-color: #FCE8E6;
  color: #C5221F;
}
.state-critical .dot-indicator {
  background-color: #C5221F;
}

.state-available {
  background-color: #E3F2FD;
  color: #1565C0;
}
.state-available .dot-indicator {
  background-color: #1565C0;
}

.state-offline {
  background-color: #F1F3F4;
  color: #5F6368;
}
.state-offline .dot-indicator {
  background-color: #5F6368;
}

.border-subtle {
  border: 1px solid #E8E6DF;
}
</style>
