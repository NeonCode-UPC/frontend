<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useTelemetryStore } from '../../application/telemetry.store.js';
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
const { searchQuery, configureHeader } = useLayoutHeader();
const telemetryStore = useTelemetryStore();

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
    placeholder: 'Filtrar por ruta, estado o SmartBox',
    visible: true
  });
  await telemetryStore.fetchContainers();

  // If query specifies container, open its detail immediately
  if (route.query.container) {
    const found = telemetryStore.containers.find(c => c.id === route.query.container);
    if (found) {
      telemetryStore.selectContainer(found);
      currentMode.value = 'detail';
    }
  }
});

// Watch route query changes
watch(() => route.query.container, (newId) => {
  if (newId) {
    const found = telemetryStore.containers.find(c => c.id === newId);
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
      c.id?.toLowerCase().includes(query) ||
      c.ambulancePlate?.toLowerCase().includes(query) ||
      c.model?.toLowerCase().includes(query) ||
      c.location?.toLowerCase().includes(query) ||
      c.status?.toLowerCase().includes(query)
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

function selectContainerForDetail(container) {
  telemetryStore.selectContainer(container);
  currentMode.value = 'detail';
  router.push({ path: '/telemetry', query: { container: container.id } });
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
  await telemetryStore.recordWeightMovement(payload);
  toast.add({
    severity: 'success',
    summary: 'Retiro Registrado',
    detail: `Se registró la extracción de viales en el SmartBox ${payload.containerId}.`,
    life: 4000
  });
}

function handleContainerLinked(payload) {
  toast.add({
    severity: 'success',
    summary: 'Contenedor Vinculado',
    detail: `SmartBox ${payload.containerId} activado exitosamente en ambulancia ${payload.ambulancePlate}.`,
    life: 4000
  });
  telemetryStore.fetchContainers();
}

function getStatusBadgeClass(container) {
  if (container.status === 'offline') return 'state-offline';
  if (container.currentTemperature > container.targetMaxTemperature || container.status === 'warning') return 'state-critical';
  if (!container.ambulancePlate || container.status === 'unlinked') return 'state-available';
  return 'state-stable';
}

function getStatusLabel(container) {
  if (container.status === 'offline') return 'Desconectado';
  if (container.currentTemperature > container.targetMaxTemperature || container.status === 'warning') return 'Crítica';
  if (!container.ambulancePlate || container.status === 'unlinked') return 'Disponible';
  return 'Estable';
}
</script>

<template>
  <div class="telemetry-view flex flex-column gap-4">
    <!-- ================= VIEW 1: CATALOG LIST (MBA-29) ================= -->
    <template v-if="currentMode === 'list'">
      <!-- Catalog Header -->
      <header class="catalog-header flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
        <div>
          <span class="breadcrumb-text text-xs text-muted block mb-1">SmartBox</span>
          <h1 class="text-2xl md:text-3xl font-bold text-main m-0">SmartBox</h1>
          <p class="subtitle text-xs text-muted mt-1 mb-0">
            {{ totalCount }} contenedores · {{ offlineCount }} sin conexión
          </p>
        </div>

        <!-- Action Button: Vincular Contenedor (MBA-29) -->
        <div class="header-action">
          <pv-button
            label="Vincular contenedor"
            icon="pi pi-link"
            class="btn-link-container px-4 py-2 text-xs border-round-pill font-bold shadow-1"
            @click="isLinkWizardVisible = true"
          />
        </div>
      </header>

      <!-- Filter Tabs & View Switcher Bar -->
      <div class="toolbar-panel flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3">
        <!-- Status Filter Pills con pill-tabs -->
        <pill-tabs
          v-model="activeFilter"
          :options="[
            { label: `Todos (${totalCount})`, value: 'all' },
            { label: `En línea (${onlineCount})`, value: 'online' },
            { label: `Sin conexión (${offlineCount})`, value: 'offline' },
            { label: `En ruta (${enRouteCount})`, value: 'en-route' }
          ]"
        />

        <!-- View Switcher (Table vs Grid) con pill-tabs segmented -->
        <pill-tabs
          v-model="displayFormat"
          variant="segmented"
          :options="[
            { icon: 'pi pi-bars', value: 'table', label: '' },
            { icon: 'pi pi-th-large', value: 'grid', label: '' }
          ]"
        />
      </div>

      <!-- Loading / Empty states -->
      <div v-if="telemetryStore.loading && !filteredContainers.length" class="empty-state p-5 text-center text-muted">
        <i class="pi pi-spin pi-spinner text-2xl text-teal mb-2"></i>
        <p class="text-xs m-0">Sincronizando contenedores IoT con el centro de control...</p>
      </div>

      <div v-else-if="!filteredContainers.length" class="empty-state p-5 text-center text-muted bg-white border-round-2xl border-subtle">
        <i class="pi pi-info-circle text-2xl text-muted mb-2"></i>
        <p class="text-sm font-semibold text-main m-0">No se encontraron SmartBoxes para este filtro.</p>
        <pv-button label="Restablecer filtros" text class="mt-2 text-xs" @click="activeFilter = 'all'" />
      </div>

      <!-- ================= OPTION A: TABLE VIEW (EXACT MBA-29) ================= -->
      <div v-else-if="displayFormat === 'table'" class="catalog-table-panel border-round-2xl overflow-hidden shadow-sm">
        <div class="table-responsive">
          <table class="smartbox-table w-full">
            <thead>
              <tr>
                <th class="th-cell text-left">SMARTBOX</th>
                <th class="th-cell text-left">AMBULANCIA</th>
                <th class="th-cell text-left">TEMPERATURA</th>
                <th class="th-cell text-left">BATERÍA</th>
                <th class="th-cell text-left">CONECTIVIDAD</th>
                <th class="th-cell text-left">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in filteredContainers"
                :key="c.id"
                class="table-row cursor-pointer transition-all"
                tabindex="0"
                @click="selectContainerForDetail(c)"
                @keydown.enter="selectContainerForDetail(c)"
              >
                <!-- SMARTBOX -->
                <td class="td-cell">
                  <span class="box-id-badge font-bold text-main">{{ c.id }}</span>
                </td>

                <!-- AMBULANCIA -->
                <td class="td-cell text-muted font-medium">
                  {{ c.ambulancePlate || '—' }}
                </td>

                <!-- TEMPERATURA -->
                <td class="td-cell font-bold text-main">
                  {{ c.status === 'offline' ? '—' : `${c.currentTemperature.toFixed(1).replace('.', ',')} °C` }}
                </td>

                <!-- BATERÍA (Battery Gauge) -->
                <td class="td-cell">
                  <battery-gauge :level="c.batteryLevel" variant="capsule" />
                </td>

                <!-- CONECTIVIDAD -->
                <td class="td-cell">
                  <span
                    class="tag-conn text-xs font-semibold px-3 py-1 border-round-pill inline-flex align-items-center gap-1"
                    :class="c.status !== 'offline' ? 'conn-on' : 'conn-off'"
                  >
                    <span class="dot-indicator" :class="c.status !== 'offline' ? 'dot-green' : 'dot-gray'"></span>
                    {{ c.status !== 'offline' ? 'En línea' : 'Sin conexión' }}
                  </span>
                </td>

                <!-- ESTADO -->
                <td class="td-cell">
                  <span
                    class="tag-state text-xs font-semibold px-3 py-1 border-round-pill inline-flex align-items-center gap-1"
                    :class="getStatusBadgeClass(c)"
                  >
                    <span class="dot-indicator"></span>
                    {{ getStatusLabel(c) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= OPTION B: GRID VIEW (CARDS) ================= -->
      <div v-else class="catalog-grid grid m-0 gap-3">
        <div
          v-for="c in filteredContainers"
          :key="c.id"
          class="col-12 sm:col-6 lg:col-4 xl:col-3 p-0"
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
      :preselected-container-id="telemetryStore.selectedContainer?.id"
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

.catalog-table-panel {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.table-responsive {
  overflow-x: auto;
}

.smartbox-table {
  border-collapse: collapse;
}

.th-cell {
  padding: 1rem 1.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5A706A;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #E8E6DF;
}

.td-cell {
  padding: 1.15rem 1.25rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #F0EFEA;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #F8FAF9;
}

.table-row:last-child .td-cell {
  border-bottom: none;
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
