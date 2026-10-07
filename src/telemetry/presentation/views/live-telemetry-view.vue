<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useTelemetryStore } from '../../application/telemetry.store.js';

// Subcomponents matching Figma designs
import LiveGaugeMonitor from '../components/live-gauge-monitor.vue';
import ThermalExcursionAlert from '../components/thermal-excursion-alert.vue';
import TelemetryHistoryTable from '../components/telemetry-history-table.vue';
import OfflineStateBanner from '../components/offline-state-banner.vue';

const store = useTelemetryStore();
const toast = useToast();

// Active Figma screen view mode: 'live' (MBA-49) | 'excursion' (MBA-50) | 'history' (MBA-53) | 'offline' (MBA-54)
const activeViewMode = ref('live');

// Active container selection
const selectedContainerId = ref('SB-0182');

// Simulation states
const isSimulatedExcursion = ref(false);
const isSimulatedOffline = ref(false);

// Dialog visibility
const showAcknowledgeDialog = ref(false);
const showCabinDialog = ref(false);
const showIncidentDialog = ref(false);
const showTransferDialog = ref(false);
const acknowledgeNote = ref('');
const isAcknowledging = ref(false);

// Initialize data from store
onMounted(async () => {
  await store.fetchContainers();
  await store.fetchTelemetryLogs('SB-0182');
});

// Current container data
const currentContainer = computed(() => {
  const target = store.containers.find(c => c.id === selectedContainerId.value);
  if (target) {
    if (isSimulatedExcursion.value && selectedContainerId.value === 'SB-0182') {
      return {
        ...target,
        currentTemperature: 9.2,
        status: 'critical'
      };
    }
    if (isSimulatedOffline.value && selectedContainerId.value === 'SB-0182') {
      return {
        ...target,
        status: 'offline',
        signalQuality: 'Sin señal'
      };
    }
    return target;
  }
  return {
    id: 'SB-0182',
    serialNumber: 'MAC-7C9EBD0182',
    currentTemperature: isSimulatedExcursion.value ? 9.2 : 4.2,
    batteryLevel: 82,
    lidStatus: 'closed',
    netWeight: 18.4,
    status: isSimulatedExcursion.value ? 'critical' : 'online'
  };
});

// React to container change
watch(selectedContainerId, async (newId) => {
  await store.fetchTelemetryLogs(newId);
  const cont = store.containers.find(c => c.id === newId);
  if (cont?.status === 'offline') {
    activeViewMode.value = 'offline';
  } else if (cont?.status === 'warning') {
    activeViewMode.value = 'excursion';
  }
});

// Toggle simulated excursion mode
function toggleExcursionSimulation() {
  isSimulatedExcursion.value = !isSimulatedExcursion.value;
  if (isSimulatedExcursion.value) {
    activeViewMode.value = 'excursion';
    toast.add({
      severity: 'error',
      summary: 'Alerta Crítica: Excursión Térmica',
      detail: 'SB-0182 alcanzó 9.2 °C (fuera del rango seguro 2-8 °C).',
      life: 5000
    });
  } else {
    activeViewMode.value = 'live';
    toast.add({
      severity: 'success',
      summary: 'Temperatura Estabilizada',
      detail: 'SB-0182 retornó a 4.2 °C dentro del rango permitido.',
      life: 3500
    });
  }
}

// Action handlers
function handleAcknowledgeAlert() {
  showAcknowledgeDialog.value = true;
}

async function confirmAcknowledge() {
  isAcknowledging.value = true;
  setTimeout(() => {
    isAcknowledging.value = false;
    showAcknowledgeDialog.value = false;
    acknowledgeNote.value = '';
    toast.add({
      severity: 'success',
      summary: 'Alerta Reconocida',
      detail: 'Protocolo de contingencia activado por Marta Rojas. Notificación enviada a cabina.',
      life: 4000
    });
  }, 700);
}

function handleContactCabin() {
  showCabinDialog.value = true;
}

function handleViewIncident() {
  showIncidentDialog.value = true;
}

function handleViewTransfer() {
  showTransferDialog.value = true;
}

function handleRetryConnection() {
  toast.add({
    severity: 'info',
    summary: 'Sondeando Gateway IoT...',
    detail: 'Enviando comando ping a SB-0165 a través de red LoRaWAN / 4G.',
    life: 3000
  });

  setTimeout(() => {
    toast.add({
      severity: 'warn',
      summary: 'Sin respuesta telemétrica',
      detail: 'El SmartBox aún se encuentra en zona de baja cobertura (Cañete). Reintentando en 30 s.',
      life: 4500
    });
  }, 2000);
}
</script>

<template>
  <div class="live-telemetry-view flex flex-column gap-3">
    <!-- View Switcher & Simulation Controller Bar -->
    <div class="view-control-toolbar screen-card border-round-xl p-2 px-3 flex flex-column sm:flex-row align-items-center justify-content-between gap-3">
      <!-- Mode Tabs (Direct access to Figma designs) -->
      <div class="mode-tabs-container flex align-items-center gap-1 overflow-x-auto w-full sm:w-auto">
        <button
          type="button"
          class="mode-tab-btn"
          :class="{ active: activeViewMode === 'live' }"
          @click="activeViewMode = 'live'"
        >
          <i class="pi pi-compass text-xs"></i>
          <span>En vivo (TR-0417)</span>
        </button>

        <button
          type="button"
          class="mode-tab-btn"
          :class="{ active: activeViewMode === 'excursion', 'has-danger': isSimulatedExcursion }"
          @click="activeViewMode = 'excursion'"
        >
          <i class="pi pi-exclamation-triangle text-xs text-red-500"></i>
          <span>Excursión térmica</span>
        </button>

        <button
          type="button"
          class="mode-tab-btn"
          :class="{ active: activeViewMode === 'history' }"
          @click="activeViewMode = 'history'"
        >
          <i class="pi pi-history text-xs"></i>
          <span>Historial 12h / 24h</span>
        </button>

        <button
          type="button"
          class="mode-tab-btn"
          :class="{ active: activeViewMode === 'offline' }"
          @click="activeViewMode = 'offline'"
        >
          <i class="pi pi-wifi text-xs"></i>
          <span>Estados de conexión</span>
        </button>
      </div>

      <!-- Quick Simulation Toggle Actions -->
      <div class="simulation-actions flex align-items-center gap-2 w-full sm:w-auto justify-content-end">
        <pv-button
          :class="isSimulatedExcursion ? 'sim-btn-active' : 'sim-btn-idle'"
          class="p-button-sm border-round-3xl text-xs py-1 px-3"
          @click="toggleExcursionSimulation"
        >
          <i :class="isSimulatedExcursion ? 'pi pi-bell-slash' : 'pi pi-bolt'" class="text-xs mr-1"></i>
          <span>{{ isSimulatedExcursion ? 'Desactivar alarma' : 'Simular excursión (9.2 °C)' }}</span>
        </pv-button>
      </div>
    </div>

    <!-- Active View Component Render -->
    <div class="view-content-canvas">
      <!-- MBA-49: Live Gauge Monitor in Route TR-0417 -->
      <live-gauge-monitor
        v-if="activeViewMode === 'live'"
        :container="currentContainer"
        transfer-id="TR-0417"
        route-path="Lima → Arequipa"
        route-origin="Clínica San Borja"
        route-destination="Hosp. Goyeneche"
        ambulance-plate="ABQ-742"
        eta="14:35"
        :logs="store.telemetryLogs"
      />

      <!-- MBA-50: Critical Thermal Excursion Alert View -->
      <thermal-excursion-alert
        v-else-if="activeViewMode === 'excursion'"
        :container="currentContainer"
        transfer-id="TR-0417"
        route-path="TR-0417 · Lima → Arequipa"
        incident-code="INC-0312"
        :current-temp="9.2"
        :baseline-temp="4.2"
        excursion-start-time="14:35"
        :elapsed-minutes="8"
        location="Km 312 · Panamericana Sur"
        eta="15:20"
        eta-delay="+45 min"
        ambulance-plate="ABQ-742"
        cold-ischemia-elapsed="4 h 05 min"
        cold-ischemia-limit="límite 6 h"
        :cold-ischemia-percent="68"
        :vials-count="24"
        @acknowledge="handleAcknowledgeAlert"
        @contact-cabin="handleContactCabin"
        @view-incident="handleViewIncident"
        @view-transfer="handleViewTransfer"
      />

      <!-- MBA-53: Telemetry Time History Table & Chart -->
      <telemetry-history-table
        v-else-if="activeViewMode === 'history'"
        :container-id="currentContainer.id || 'SB-0182'"
        transfer-id="TR-0417"
        :logs="store.telemetryLogs"
      />

      <!-- MBA-54: IoT Connection States & No Signal Feedback -->
      <offline-state-banner
        v-else-if="activeViewMode === 'offline'"
        :container-id="currentContainer.id || 'SB-0182'"
        offline-container-id="SB-0165"
        :last-temp="4.9"
        last-time="13:34"
        :last-ping-seconds="3"
        mode="gallery"
        @retry="handleRetryConnection"
      />
    </div>

    <!-- Modal 1: Reconocer Alerta Crítica (Mitigación) -->
    <pv-dialog
      v-model:visible="showAcknowledgeDialog"
      modal
      header="Reconocer Alerta de Excursión Térmica"
      :style="{ width: 'min(92vw, 480px)' }"
    >
      <div class="flex flex-column gap-3">
        <div class="p-3 border-round-xl bg-red-50 border-1 border-red-200 text-xs">
          <strong class="text-red-700 block mb-1">Incidente INC-0312 · SmartBox SB-0182</strong>
          <span class="text-red-600">
            La temperatura se encuentra en 9.2 °C (umbral máximo 8.0 °C). Al reconocer, confirmas que la tripulación y central médica han sido alertadas.
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-main mb-1">Acción o Instrucción Médica Inmediata</label>
          <pv-textarea
            v-model="acknowledgeNote"
            rows="3"
            class="w-full text-xs"
            placeholder="Ej.: Se instruyó a la cabina revisar conexión del cable vehicular de 12V y mantener sellada la escotilla..."
          />
        </div>
      </div>

      <template #footer>
        <pv-button
          label="Cancelar"
          severity="secondary"
          text
          @click="showAcknowledgeDialog = false"
        />
        <pv-button
          label="Confirmar Acuse de Recibo"
          class="btn-confirm-ack"
          :loading="isAcknowledging"
          @click="confirmAcknowledge"
        />
      </template>
    </pv-dialog>

    <!-- Modal 2: Contactar Cabina de Ambulancia -->
    <pv-dialog
      v-model:visible="showCabinDialog"
      modal
      header="Comunicación Directa con Cabina"
      :style="{ width: 'min(92vw, 460px)' }"
    >
      <div class="flex flex-column gap-3 text-xs">
        <div class="screen-card p-3 border-round-xl flex align-items-center justify-content-between">
          <div>
            <strong class="text-main block">Ambulancia Tipo III</strong>
            <span class="text-muted">Placa: ABQ-742 · Traslado TR-0417</span>
          </div>
          <pv-tag value="En Ruta" severity="success" class="text-xs" />
        </div>

        <div class="screen-card p-3 border-round-xl flex flex-column gap-2">
          <div class="flex justify-content-between">
            <span class="text-muted">Conductor Asignado:</span>
            <strong class="text-main">Luis Quispe Palacios</strong>
          </div>
          <div class="flex justify-content-between">
            <span class="text-muted">Radio Frecuencia VHF:</span>
            <strong class="text-teal">Canal 4 · 154.600 MHz</strong>
          </div>
          <div class="flex justify-content-between">
            <span class="text-muted">Línea Móvil Satelital:</span>
            <strong class="text-main">+51 984 123 456</strong>
          </div>
        </div>

        <p class="text-muted m-0">
          Ubicación satelital actual: <strong>Km 312 Panamericana Sur</strong>, a 45 min del Hospital Goyeneche.
        </p>
      </div>

      <template #footer>
        <pv-button
          label="Cerrar"
          severity="secondary"
          text
          @click="showCabinDialog = false"
        />
        <pv-button
          label="Llamar a Cabina"
          icon="pi pi-phone"
          class="btn-call-cabin"
          @click="showCabinDialog = false; toast.add({ severity: 'info', summary: 'Llamada Iniciada', detail: 'Conectando con terminal VoIP de cabina ABQ-742...', life: 3000 })"
        />
      </template>
    </pv-dialog>

    <!-- Modal 3: Ver Incidente INC-0312 -->
    <pv-dialog
      v-model:visible="showIncidentDialog"
      modal
      header="Ficha de Incidente INC-0312"
      :style="{ width: 'min(92vw, 500px)' }"
    >
      <div class="flex flex-column gap-3 text-xs">
        <div class="p-3 border-round-xl bg-orange-50 border-1 border-orange-200 flex justify-content-between align-items-center">
          <div>
            <strong class="text-orange-900 block">Excursión Térmica en Ruta</strong>
            <span class="text-orange-700">Severidad: Crítica · Detección: 14:35</span>
          </div>
          <pv-tag value="Abierto" severity="warn" />
        </div>

        <div class="grid m-0">
          <div class="col-6 p-1">
            <span class="text-muted block">SmartBox</span>
            <strong class="text-main">SB-0182</strong>
          </div>
          <div class="col-6 p-1">
            <span class="text-muted block">Carga Afectada</span>
            <strong class="text-main">24 viales de vacuna</strong>
          </div>
          <div class="col-6 p-1">
            <span class="text-muted block">Temp. Máxima</span>
            <strong class="text-red-500">9.2 °C (+1.2 °C exceso)</strong>
          </div>
          <div class="col-6 p-1">
            <span class="text-muted block">Tiempo en Excursión</span>
            <strong class="text-main">8 minutos</strong>
          </div>
        </div>

        <div class="border-top-1 border-200 pt-2 text-muted">
          Notificaciones enviadas automáticamente a la central médica y personal de turno Marta Rojas.
        </div>
      </div>

      <template #footer>
        <pv-button
          label="Cerrar"
          severity="secondary"
          @click="showIncidentDialog = false"
        />
      </template>
    </pv-dialog>

    <!-- Modal 4: Ver Detalle del Traslado TR-0417 -->
    <pv-dialog
      v-model:visible="showTransferDialog"
      modal
      header="Detalle del Traslado TR-0417"
      :style="{ width: 'min(92vw, 480px)' }"
    >
      <div class="flex flex-column gap-3 text-xs">
        <div class="screen-card p-3 border-round-xl flex flex-column gap-2">
          <div class="flex justify-content-between">
            <span class="text-muted">Ruta:</span>
            <strong class="text-main">Lima (Clínica San Borja) → Arequipa (Hosp. Goyeneche)</strong>
          </div>
          <div class="flex justify-content-between">
            <span class="text-muted">Hora de Salida:</span>
            <span class="text-main font-semibold">08:05</span>
          </div>
          <div class="flex justify-content-between">
            <span class="text-muted">ETA Original:</span>
            <span class="text-main font-semibold">14:35 (retraso actual: +45 min)</span>
          </div>
          <div class="flex justify-content-between">
            <span class="text-muted">Isquemia Fría Acumulada:</span>
            <span class="text-teal font-semibold">4 h 05 min (límite médico: 6 h 00 min)</span>
          </div>
        </div>
      </div>

      <template #footer>
        <pv-button
          label="Entendido"
          severity="secondary"
          @click="showTransferDialog = false"
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
</style>
