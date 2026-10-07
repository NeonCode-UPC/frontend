<script setup>
import { ref, computed, watch } from 'vue';

/**
 * Modal dialog to confirm detected load cell mass variation and vial withdrawal (MBA-52).
 */
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  container: {
    type: Object,
    default: null
  },
  defaultDiff: {
    type: Number,
    default: -0.8
  },
  defaultUnits: {
    type: Number,
    default: 2
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

const responsible = ref('Marta Rojas · paramédica');
const weightDiff = ref(-0.8);
const isSubmitting = ref(false);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    weightDiff.value = props.defaultDiff;
    responsible.value = 'Marta Rojas · paramédica';
  }
});

const unitWeight = computed(() => props.container?.unitWeight || 0.4);

const estimatedUnits = computed(() => {
  const units = Math.round(Math.abs(weightDiff.value) / unitWeight.value);
  return units > 0 ? units : 1;
});

function handleClose() {
  emit('update:visible', false);
}

function handleConfirm() {
  isSubmitting.value = true;
  emit('confirm', {
    containerId: props.container?.id || 'SB-0182',
    weightDiff: weightDiff.value,
    units: -Math.abs(estimatedUnits.value),
    responsible: responsible.value
  });
  isSubmitting.value = false;
  emit('update:visible', false);
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :closable="true"
    :dismissable-mask="true"
    :style="{ width: '480px', maxWidth: '95vw' }"
    class="stock-weight-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="modal-header">
        <h2 class="text-xl font-bold text-main m-0">Confirmar retiro detectado</h2>
        <p class="text-xs text-muted mt-1 mb-0">El sensor de peso registró una variación</p>
      </div>
    </template>

    <div class="modal-body flex flex-column gap-3 py-2">
      <!-- 2 Cards: Diferencia de masa & Estimado -->
      <div class="grid m-0 gap-2">
        <!-- Diferencia de masa -->
        <div class="col p-0">
          <div class="metric-card p-3 border-round-2xl">
            <span class="metric-label block text-xs">Diferencia de masa</span>
            <div class="metric-value text-2xl font-bold mt-1">
              {{ weightDiff < 0 ? `${weightDiff.toFixed(1).replace('.', ',')} kg` : `+${weightDiff.toFixed(1).replace('.', ',')} kg` }}
            </div>
            <small class="text-2xs text-muted block mt-1">Sensor HX711 (±0.05 kg)</small>
          </div>
        </div>

        <!-- Estimado -->
        <div class="col p-0">
          <div class="metric-card p-3 border-round-2xl">
            <span class="metric-label block text-xs">Estimado ({{ unitWeight.toFixed(1).replace('.', ',') }} kg c/u)</span>
            <div class="metric-value text-2xl font-bold mt-1">
              {{ estimatedUnits }} viales
            </div>
            <small class="text-2xs text-teal block mt-1 font-semibold">Cálculo biométrico</small>
          </div>
        </div>
      </div>

      <!-- Retirado Por Card / Input Field -->
      <div class="responsible-field p-3 border-round-2xl">
        <label for="responsible-input" class="responsible-label block text-2xs font-bold uppercase tracking-wider mb-1">
          Retirado por
        </label>
        <pv-input-text
          id="responsible-input"
          v-model="responsible"
          class="w-full responsible-input border-none p-0 text-sm font-semibold"
          placeholder="Nombre y cargo del responsable"
        />
      </div>

      <div class="notice-info flex align-items-center gap-2 p-2 border-round-lg">
        <i class="pi pi-shield text-teal text-xs"></i>
        <span class="text-2xs text-muted">
          Este registro se vinculará a la cadena de custodia del SmartBox {{ container?.id || 'SB-0182' }}.
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end align-items-center gap-2 pt-2">
        <pv-button
          label="Cancelar"
          class="btn-cancel px-4 py-2 text-xs border-round-pill"
          text
          @click="handleClose"
        />
        <pv-button
          label="Registrar retiro"
          class="btn-confirm px-4 py-2 text-xs border-round-pill font-bold"
          :loading="isSubmitting"
          @click="handleConfirm"
        />
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

.metric-card {
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

.metric-label {
  color: #5A706A;
}

.metric-value {
  color: #10312F;
}

.responsible-field {
  background-color: #FFFFFF;
  border: 1.5px solid #0F7A70;
}

.responsible-label {
  color: #5A706A;
  letter-spacing: 0.05em;
}

.responsible-input {
  background: transparent !important;
  color: #10312F;
  box-shadow: none !important;
}

.responsible-input:focus {
  outline: none;
}

.notice-info {
  background-color: #F8FAF9;
  border: 1px solid #E2E8F0;
}

.btn-cancel {
  background-color: #FFFFFF !important;
  border: 1px solid #D1D5DB !important;
  color: #374151 !important;
}

.btn-cancel:hover {
  background-color: #F9FAFB !important;
}

.btn-confirm {
  background-color: #0F7A70 !important;
  border: 1px solid #0F7A70 !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(15, 122, 112, 0.25);
}

.btn-confirm:hover {
  background-color: #0B5C55 !important;
  border-color: #0B5C55 !important;
}
</style>
