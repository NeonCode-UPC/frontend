<script setup>
import { ref, computed, watch } from 'vue';
import { useTelemetryStore } from '../../application/telemetry.store.js';

/**
 * 3-step Wizard modal for linking a SmartBox IoT device to an ambulance (MBA-33, MBA-34, MBA-35).
 */
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  preselectedContainerId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'linked']);

const telemetryStore = useTelemetryStore();

const currentStep = ref(1);
const selectedAmbulance = ref(null);
const selectedContainerId = ref('');
const isActivating = ref(false);
const activationProgress = ref(0);

// Available ambulances list (matching MBA-33)
const availableAmbulances = ref([
  { plate: 'AUC-215', model: 'Hyundai H350', location: 'San Borja', status: 'available' },
  { plate: 'BHM-903', model: 'Renault Master', location: 'Miraflores', status: 'available' },
  { plate: 'A7K-421', model: 'Mercedes Sprinter', location: 'San Borja', status: 'available' },
  { plate: 'C9M-714', model: 'Ford Transit', location: 'La Molina', status: 'available' }
]);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentStep.value = 1;
    selectedAmbulance.value = availableAmbulances.value[0]; // Default AUC-215
    selectedContainerId.value = props.preselectedContainerId || 'SB-0165';
    activationProgress.value = 0;
    isActivating.value = false;
  }
});

// Container validation
const targetContainer = computed(() => {
  return telemetryStore.containers.find(c => c.id === selectedContainerId.value);
});

const isContainerAlreadyLinked = computed(() => {
  if (!targetContainer.value) return false;
  return Boolean(targetContainer.value.ambulancePlate);
});

const conflictingPlate = computed(() => {
  return targetContainer.value?.ambulancePlate || '';
});

// Step navigation
function goToStep(step) {
  if (step === 2 && !selectedAmbulance.value) return;
  if (step === 3 && (isContainerAlreadyLinked.value || !selectedContainerId.value)) return;
  currentStep.value = step;
  if (step === 3) {
    startActivationSimulation();
  }
}

function startActivationSimulation() {
  activationProgress.value = 15;
  const interval = setInterval(() => {
    if (activationProgress.value < 100) {
      activationProgress.value += 20;
    } else {
      clearInterval(interval);
    }
  }, 200);
}

function handleClose() {
  emit('update:visible', false);
}

async function handleCompleteLink() {
  if (!selectedAmbulance.value || !selectedContainerId.value) return;
  isActivating.value = true;
  try {
    await telemetryStore.linkContainer({
      containerId: selectedContainerId.value,
      ambulancePlate: selectedAmbulance.value.plate
    });
    emit('linked', {
      containerId: selectedContainerId.value,
      ambulancePlate: selectedAmbulance.value.plate
    });
    emit('update:visible', false);
  } finally {
    isActivating.value = false;
  }
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :closable="true"
    :dismissable-mask="true"
    :style="{ width: '740px', maxWidth: '96vw' }"
    class="link-wizard-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="w-full flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
        <div>
          <span class="breadcrumb-text text-xs text-muted block mb-1">Ambulancias / vincular</span>
          <h2 class="text-2xl font-bold text-main m-0">Vincular contenedor</h2>
          <span class="text-xs text-muted mt-1 block">
            <template v-if="currentStep === 1">Paso 1 de 3 · ambulancia disponible</template>
            <template v-else-if="currentStep === 2">Paso 2 de 3 · identificador único del SmartBox</template>
            <template v-else>Paso 3 de 3 · confirmación</template>
          </span>
        </div>

        <!-- Step Pills Indicator -->
        <div class="steps-nav flex align-items-center gap-2">
          <span
            class="step-pill text-xs font-semibold px-3 py-1 border-round-pill transition-all"
            :class="currentStep === 1 ? 'step-active' : 'step-inactive'"
          >
            1 Ambulancia
          </span>
          <span
            class="step-pill text-xs font-semibold px-3 py-1 border-round-pill transition-all"
            :class="currentStep === 2 ? 'step-active' : 'step-inactive'"
          >
            2 SmartBox
          </span>
          <span
            class="step-pill text-xs font-semibold px-3 py-1 border-round-pill transition-all"
            :class="currentStep === 3 ? 'step-active' : 'step-inactive'"
          >
            3 Confirmar
          </span>
        </div>
      </div>
    </template>

    <div class="wizard-body py-3">
      <!-- ================= STEP 1: Selección de Ambulancia (MBA-33) ================= -->
      <div v-if="currentStep === 1" class="step-1-content flex flex-column gap-3">
        <div class="panel-card p-4 border-round-2xl">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="panel-title text-sm font-bold m-0 text-main">Ambulancias disponibles</h3>
            <span class="badge-count text-xs font-bold px-2 py-1 border-round-pill">
              • {{ availableAmbulances.length }}
            </span>
          </div>

          <div class="ambulance-list flex flex-column gap-2">
            <div
              v-for="amb in availableAmbulances"
              :key="amb.plate"
              class="ambulance-row p-3 border-round-xl flex justify-content-between align-items-center cursor-pointer transition-all"
              :class="{ 'row-selected': selectedAmbulance?.plate === amb.plate }"
              @click="selectedAmbulance = amb"
            >
              <div class="flex align-items-center gap-3">
                <div class="amb-plate text-sm font-bold text-main">{{ amb.plate }}</div>
                <div class="amb-detail text-xs text-muted">{{ amb.model }} · {{ amb.location }}</div>
              </div>

              <span
                class="amb-badge text-xs font-semibold px-3 py-1 border-round-pill"
                :class="selectedAmbulance?.plate === amb.plate ? 'badge-chosen' : 'badge-avail'"
              >
                • {{ selectedAmbulance?.plate === amb.plate ? 'Elegida' : 'Disponible' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= STEP 2: Identificador del Contenedor (MBA-34) ================= -->
      <div v-if="currentStep === 2" class="step-2-content flex flex-column gap-3">
        <div class="grid m-0 gap-3">
          <!-- Left: Selected Ambulance Card -->
          <div class="col-12 md:col-5 p-0">
            <div class="panel-card p-3 border-round-2xl h-full flex flex-column justify-content-between">
              <div>
                <span class="text-xs text-muted block mb-2 font-medium">Ambulancia</span>
                <div class="amb-plate text-base font-bold text-main">{{ selectedAmbulance?.plate }}</div>
                <div class="text-xs text-muted mt-1">{{ selectedAmbulance?.model }}</div>
              </div>
              <div class="mt-3">
                <span class="amb-badge badge-chosen text-xs font-semibold px-3 py-1 border-round-pill inline-block">
                  • Elegida
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Container Selector / Input with Validation -->
          <div class="col-12 md:col p-0">
            <div
              class="panel-card p-3 border-round-2xl h-full flex flex-column justify-content-between transition-all"
              :class="{ 'card-error': isContainerAlreadyLinked }"
            >
              <div>
                <label for="container-select" class="block text-2xs font-bold text-muted uppercase tracking-wider mb-2">
                  Identificador del contenedor
                </label>
                <div class="flex gap-2">
                  <pv-select
                    id="container-select"
                    v-model="selectedContainerId"
                    :options="telemetryStore.containers"
                    option-label="id"
                    option-value="id"
                    placeholder="Seleccionar SmartBox"
                    class="w-full text-sm font-bold select-custom"
                  />
                </div>
              </div>

              <!-- Error notice if already linked -->
              <div v-if="isContainerAlreadyLinked" class="error-notice mt-2 text-xs flex align-items-center gap-1">
                <i class="pi pi-exclamation-circle text-xs"></i>
                <span>{{ selectedContainerId }} ya está vinculado a {{ conflictingPlate }}. Desvincúlalo primero.</span>
              </div>
              <div v-else class="success-notice mt-2 text-xs flex align-items-center gap-1">
                <i class="pi pi-check-circle text-xs text-teal"></i>
                <span class="text-teal font-semibold">Listo para vincular a {{ selectedAmbulance?.plate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Notice Banner -->
        <div class="info-banner p-3 border-round-2xl flex align-items-center gap-3">
          <div class="info-icon-circle flex align-items-center justify-content-center border-round-circle">
            <i class="pi pi-link text-white text-sm"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-main m-0">Un contenedor por ambulancia</h4>
            <p class="text-xs text-muted m-0 mt-1">Cada placa admite un solo contenedor a la vez.</p>
          </div>
        </div>
      </div>

      <!-- ================= STEP 3: Confirmación y Activación 12V (MBA-35) ================= -->
      <div v-if="currentStep === 3" class="step-3-content flex flex-column gap-3">
        <div class="grid m-0 gap-3">
          <!-- Left: Summary -->
          <div class="col-12 md:col-5 p-0">
            <div class="panel-card p-4 border-round-2xl h-full flex flex-column justify-content-between gap-3">
              <h3 class="text-sm font-bold text-main m-0">Resumen</h3>
              <div class="flex flex-column gap-3">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <span class="text-2xs text-muted block">Ambulancia</span>
                    <strong class="text-sm text-main">{{ selectedAmbulance?.plate }}</strong>
                  </div>
                  <span class="badge-neutral text-xs px-2 py-1 border-round-pill">
                    • {{ selectedAmbulance?.model }}
                  </span>
                </div>
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <span class="text-2xs text-muted block">SmartBox</span>
                    <strong class="text-sm text-main">{{ selectedContainerId }}</strong>
                  </div>
                  <span class="badge-chosen text-xs px-2 py-1 border-round-pill">
                    • Disponible
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Telemetry 12V Activation Simulation -->
          <div class="col-12 md:col p-0">
            <div class="panel-card p-4 border-round-2xl h-full flex flex-column align-items-center justify-content-center text-center">
              <div class="spinner-circle mb-3 flex align-items-center justify-content-center">
                <i class="pi pi-spin pi-spinner text-teal text-3xl"></i>
              </div>
              <h3 class="text-base font-bold text-main m-0">Activando telemetría de 12 V...</h3>
              <div class="progress-bar-track mt-3 w-full border-round-pill">
                <div
                  class="progress-bar-fill border-round-pill"
                  :style="{ width: `${activationProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-muted mt-2 mb-0">Esperando la primera lectura del contenedor</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wizard Footer Actions -->
    <template #footer>
      <div class="flex justify-content-between align-items-center pt-2">
        <div>
          <pv-button
            v-if="currentStep > 1"
            label="Atrás"
            icon="pi pi-chevron-left"
            class="btn-back px-3 py-2 text-xs border-round-pill"
            text
            @click="currentStep--"
          />
        </div>

        <div class="flex align-items-center gap-2">
          <!-- Step 1 Next -->
          <pv-button
            v-if="currentStep === 1"
            label="Continuar"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
            :disabled="!selectedAmbulance"
            @click="goToStep(2)"
          />

          <!-- Step 2 Next or Conflict -->
          <template v-else-if="currentStep === 2">
            <pv-button
              v-if="isContainerAlreadyLinked"
              label="Usar otro SmartBox"
              class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
              @click="selectedContainerId = 'SB-0165'"
            />
            <pv-button
              v-else
              label="Continuar"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
              :disabled="!selectedContainerId"
              @click="goToStep(3)"
            />
          </template>

          <!-- Step 3 Activate -->
          <pv-button
            v-else-if="currentStep === 3"
            label="Activar telemetría"
            icon="pi pi-check"
            class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
            :loading="isActivating"
            @click="handleCompleteLink"
          />
        </div>
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
:deep(.p-dialog) {
  border-radius: 24px;
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
  box-shadow: 0 20px 40px rgba(16, 49, 47, 0.12);
}

:deep(.p-dialog-header) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  border-bottom: none;
}

:deep(.p-dialog-content) {
  padding: 0 1.5rem 1rem 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  border-top: none;
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

.text-2xs {
  font-size: 0.7rem;
}

.steps-nav {
  background-color: #F6F5EF;
  padding: 4px;
  border-radius: 9999px;
}

.step-pill {
  line-height: 1.2;
}

.step-active {
  background-color: #10312F;
  color: #FFFFFF;
}

.step-inactive {
  background-color: transparent;
  color: #5A706A;
}

.panel-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.card-error {
  border-color: #E05A46 !important;
  background-color: #FFFDFD;
}

.badge-count {
  background-color: #E6F4EA;
  color: #137333;
}

.ambulance-row {
  border: 1px solid #E8E6DF;
  background-color: #FFFFFF;
}

.ambulance-row:hover {
  background-color: #F8FAF9;
  border-color: #0F7A70;
}

.row-selected {
  border-color: #0F7A70 !important;
  background-color: #F8FAF9;
  box-shadow: 0 0 0 1px #0F7A70;
}

.badge-chosen {
  background-color: #E6F4EA;
  color: #137333;
}

.badge-avail {
  background-color: #F1F3F4;
  color: #5F6368;
}

.badge-neutral {
  background-color: #F1F3F4;
  color: #5F6368;
}

.info-banner {
  background-color: #EEF4FA;
  border: 1px solid #D6E4F0;
}

.info-icon-circle {
  width: 32px;
  height: 32px;
  background-color: #1A365D;
}

.error-notice {
  color: #C5221F;
}

.success-notice {
  color: #0F7A70;
}

.progress-bar-track {
  height: 6px;
  background-color: #E2E8F0;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #0F7A70;
  transition: width 0.3s ease;
}

.btn-primary {
  background-color: #0F7A70 !important;
  border: 1px solid #0F7A70 !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(15, 122, 112, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background-color: #0B5C55 !important;
  border-color: #0B5C55 !important;
}

.btn-back {
  color: #5A706A !important;
}

:deep(.select-custom) {
  border-radius: 12px;
  border-color: #E8E6DF;
}
</style>
