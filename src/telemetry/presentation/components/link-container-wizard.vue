<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useTelemetryStore } from '../../application/telemetry.store.js';
import { LinkContainerCommand } from '../../domain/link-container.command.js';

/**
 * 3-step Wizard modal for linking a SmartBox IoT device to an ambulance (MBA-33, MBA-34, MBA-35).
 */
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  preselectedContainerId: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'linked']);
const { t } = useI18n();
const toast = useToast();
const telemetryStore = useTelemetryStore();

const currentStep = ref(1);
const selectedAmbulance = ref(null);
const selectedContainerId = ref('');
const isActivating = ref(false);
const activationProgress = ref(0);
let activationTimer = null;

// Available ambulances (MBA-33).
// Pending dependency: read them from `/ambulances` once the Transport BC fills that collection (plan 3.5).
const availableAmbulances = ref([
  { plate: 'AUC-215', model: 'Hyundai H350', location: 'San Borja', status: 'available' },
  { plate: 'BHM-903', model: 'Renault Master', location: 'Miraflores', status: 'available' },
  { plate: 'A7K-421', model: 'Mercedes Sprinter', location: 'San Borja', status: 'available' },
  { plate: 'C9M-714', model: 'Ford Transit', location: 'La Molina', status: 'available' }
]);

const firstUnlinkedContainerId = computed(() =>
  telemetryStore.containers.find(c => !c.ambulancePlate && c.status !== 'offline')?.id ?? '');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentStep.value = 1;
    selectedAmbulance.value = availableAmbulances.value[0] || null;
    selectedContainerId.value = props.preselectedContainerId || firstUnlinkedContainerId.value;
    activationProgress.value = 0;
    isActivating.value = false;
  } else {
    clearInterval(activationTimer);
  }
});

onBeforeUnmount(() => clearInterval(activationTimer));

// Container validation
const targetContainer = computed(() => telemetryStore.findContainer(selectedContainerId.value));

const isContainerAlreadyLinked = computed(() => Boolean(targetContainer.value?.ambulancePlate));

const conflictingPlate = computed(() => targetContainer.value?.ambulancePlate || '');

const stepDescription = computed(() => t(`telemetry.wizard.step-${currentStep.value}`));

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
  clearInterval(activationTimer);
  activationProgress.value = 15;
  activationTimer = setInterval(() => {
    if (activationProgress.value < 100) {
      activationProgress.value = Math.min(100, activationProgress.value + 20);
    } else {
      clearInterval(activationTimer);
    }
  }, 200);
}

async function handleCompleteLink() {
  if (!selectedAmbulance.value || !selectedContainerId.value) return;
  isActivating.value = true;
  try {
    const command = new LinkContainerCommand({
      containerId: selectedContainerId.value,
      ambulancePlate: selectedAmbulance.value.plate
    });
    await telemetryStore.linkContainer(command);
    emit('linked', { containerId: command.containerId, ambulancePlate: command.ambulancePlate });
    emit('update:visible', false);
  } catch {
    toast.add({
      severity: 'error',
      summary: t('telemetry.toast.error-summary'),
      detail: t('telemetry.toast.error-detail'),
      life: 4000
    });
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
    :aria-label="t('telemetry.wizard.title')"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="w-full flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
        <div>
          <span class="breadcrumb-text text-xs text-muted block mb-1">{{ t('telemetry.wizard.breadcrumb') }}</span>
          <h2 class="text-2xl font-bold text-main m-0">{{ t('telemetry.wizard.title') }}</h2>
          <span class="text-xs text-muted mt-1 block" aria-live="polite">{{ stepDescription }}</span>
        </div>

        <!-- Step Pills Indicator -->
        <ol class="steps-nav flex align-items-center gap-2 list-none p-0 m-0" :aria-label="t('telemetry.wizard.steps-label')">
          <li
            v-for="step in [1, 2, 3]"
            :key="step"
            class="step-pill text-xs font-semibold px-3 py-1 border-round-pill transition-all"
            :class="currentStep === step ? 'step-active' : 'step-inactive'"
            :aria-current="currentStep === step ? 'step' : undefined"
          >
            {{ step }} {{ t(`telemetry.wizard.step-name-${step}`) }}
          </li>
        </ol>
      </div>
    </template>

    <div class="wizard-body py-3">
      <!-- ================= STEP 1: Ambulance (MBA-33) ================= -->
      <div v-if="currentStep === 1" class="step-1-content flex flex-column gap-3">
        <div class="panel-card p-4 border-round-2xl">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 id="ambulance-list-title" class="panel-title text-sm font-bold m-0 text-main">{{ t('telemetry.wizard.available-ambulances') }}</h3>
            <span class="badge-count text-xs font-bold px-2 py-1 border-round-pill">
              • {{ availableAmbulances.length }}
            </span>
          </div>

          <div class="ambulance-list flex flex-column gap-2" role="radiogroup" aria-labelledby="ambulance-list-title">
            <div
              v-for="amb in availableAmbulances"
              :key="amb.plate"
              class="ambulance-row p-3 border-round-xl flex justify-content-between align-items-center cursor-pointer transition-all"
              :class="{ 'row-selected': selectedAmbulance?.plate === amb.plate }"
              role="radio"
              tabindex="0"
              :aria-checked="selectedAmbulance?.plate === amb.plate"
              @click="selectedAmbulance = amb"
              @keydown.enter.prevent="selectedAmbulance = amb"
              @keydown.space.prevent="selectedAmbulance = amb"
            >
              <div class="flex align-items-center gap-3">
                <div class="amb-plate text-sm font-bold text-main">{{ amb.plate }}</div>
                <div class="amb-detail text-xs text-muted">{{ amb.model }} · {{ amb.location }}</div>
              </div>

              <span
                class="amb-badge text-xs font-semibold px-3 py-1 border-round-pill"
                :class="selectedAmbulance?.plate === amb.plate ? 'badge-chosen' : 'badge-avail'"
              >
                • {{ selectedAmbulance?.plate === amb.plate ? t('telemetry.wizard.chosen') : t('telemetry.wizard.available') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= STEP 2: Container identifier (MBA-34) ================= -->
      <div v-if="currentStep === 2" class="step-2-content flex flex-column gap-3">
        <div class="grid m-0 gap-3">
          <div class="col-12 md:col-5 p-0">
            <div class="panel-card p-3 border-round-2xl h-full flex flex-column justify-content-between">
              <div>
                <span class="text-xs text-muted block mb-2 font-medium">{{ t('telemetry.wizard.ambulance') }}</span>
                <div class="amb-plate text-base font-bold text-main">{{ selectedAmbulance?.plate }}</div>
                <div class="text-xs text-muted mt-1">{{ selectedAmbulance?.model }}</div>
              </div>
              <div class="mt-3">
                <span class="amb-badge badge-chosen text-xs font-semibold px-3 py-1 border-round-pill inline-block">
                  • {{ t('telemetry.wizard.chosen') }}
                </span>
              </div>
            </div>
          </div>

          <div class="col-12 md:col p-0">
            <div
              class="panel-card p-3 border-round-2xl h-full flex flex-column justify-content-between transition-all"
              :class="{ 'card-error': isContainerAlreadyLinked }"
            >
              <div>
                <label for="container-select" class="block text-2xs font-bold text-muted uppercase tracking-wider mb-2">
                  {{ t('telemetry.wizard.container-id') }}
                </label>
                <div class="flex gap-2">
                  <pv-select
                    v-model="selectedContainerId"
                    input-id="container-select"
                    :options="telemetryStore.containers"
                    option-label="displayCode"
                    option-value="id"
                    :placeholder="t('telemetry.wizard.select-container')"
                    class="w-full text-sm font-bold select-custom"
                    :invalid="isContainerAlreadyLinked"
                    aria-describedby="container-select-feedback"
                  />
                </div>
              </div>

              <div v-if="isContainerAlreadyLinked" id="container-select-feedback" class="error-notice mt-2 text-xs flex align-items-center gap-1" role="alert">
                <i class="pi pi-exclamation-circle text-xs" aria-hidden="true"></i>
                <span>{{ t('telemetry.wizard.already-linked', { id: targetContainer?.displayCode || selectedContainerId, plate: conflictingPlate }) }}</span>
              </div>
              <div v-else id="container-select-feedback" class="success-notice mt-2 text-xs flex align-items-center gap-1" role="status">
                <i class="pi pi-check-circle text-xs text-teal" aria-hidden="true"></i>
                <span class="text-teal font-semibold">{{ t('telemetry.wizard.ready', { plate: selectedAmbulance?.plate }) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-banner p-3 border-round-2xl flex align-items-center gap-3">
          <div class="info-icon-circle flex align-items-center justify-content-center border-round-circle" aria-hidden="true">
            <i class="pi pi-link text-white text-sm"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-main m-0">{{ t('telemetry.wizard.rule-title') }}</h4>
            <p class="text-xs text-muted m-0 mt-1">{{ t('telemetry.wizard.rule-detail') }}</p>
          </div>
        </div>
      </div>

      <!-- ================= STEP 3: Confirmation and 12 V activation (MBA-35) ================= -->
      <div v-if="currentStep === 3" class="step-3-content flex flex-column gap-3">
        <div class="grid m-0 gap-3">
          <div class="col-12 md:col-5 p-0">
            <div class="panel-card p-4 border-round-2xl h-full flex flex-column justify-content-between gap-3">
              <h3 class="text-sm font-bold text-main m-0">{{ t('telemetry.wizard.summary') }}</h3>
              <dl class="flex flex-column gap-3 m-0">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <dt class="text-2xs text-muted block">{{ t('telemetry.wizard.ambulance') }}</dt>
                    <dd class="text-sm text-main font-bold m-0">{{ selectedAmbulance?.plate }}</dd>
                  </div>
                  <span class="badge-neutral text-xs px-2 py-1 border-round-pill">
                    • {{ selectedAmbulance?.model }}
                  </span>
                </div>
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <dt class="text-2xs text-muted block">{{ t('telemetry.name') }}</dt>
                    <dd class="text-sm text-main font-bold m-0">{{ targetContainer?.displayCode || selectedContainerId }}</dd>
                  </div>
                  <span class="badge-chosen text-xs px-2 py-1 border-round-pill">
                    • {{ t('telemetry.wizard.available') }}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          <div class="col-12 md:col p-0">
            <div class="panel-card p-4 border-round-2xl h-full flex flex-column align-items-center justify-content-center text-center">
              <div class="spinner-circle mb-3 flex align-items-center justify-content-center" aria-hidden="true">
                <i class="pi pi-spin pi-spinner text-teal text-3xl"></i>
              </div>
              <h3 class="text-base font-bold text-main m-0">{{ t('telemetry.wizard.activating') }}</h3>
              <div
                class="progress-bar-track mt-3 w-full border-round-pill"
                role="progressbar"
                :aria-label="t('telemetry.wizard.activating')"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="activationProgress"
              >
                <div class="progress-bar-fill border-round-pill" :style="{ width: `${activationProgress}%` }"></div>
              </div>
              <p class="text-xs text-muted mt-2 mb-0">{{ t('telemetry.wizard.waiting-reading') }}</p>
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
            :label="t('telemetry.action.back')"
            icon="pi pi-chevron-left"
            class="btn-back px-3 py-2 text-xs border-round-pill"
            text
            @click="currentStep--"
          />
        </div>

        <div class="flex align-items-center gap-2">
          <pv-button
            v-if="currentStep === 1"
            :label="t('telemetry.action.continue')"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
            :disabled="!selectedAmbulance"
            @click="goToStep(2)"
          />

          <template v-else-if="currentStep === 2">
            <pv-button
              v-if="isContainerAlreadyLinked"
              :label="t('telemetry.wizard.use-other')"
              class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
              :disabled="!firstUnlinkedContainerId"
              @click="selectedContainerId = firstUnlinkedContainerId"
            />
            <pv-button
              v-else
              :label="t('telemetry.action.continue')"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="btn-primary px-4 py-2 text-xs border-round-pill font-bold"
              :disabled="!selectedContainerId"
              @click="goToStep(3)"
            />
          </template>

          <pv-button
            v-else-if="currentStep === 3"
            :label="t('telemetry.wizard.activate')"
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
