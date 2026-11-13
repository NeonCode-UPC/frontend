<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTelemetryStore } from '../../application/telemetry.store.js';
import { CreateSmartContainerCommand } from '../../domain/create-smart-container.command.js';
import { ThermalThresholds } from '../../domain/thermal-thresholds.value-object.js';

/**
 * Modal dialog to register a new SmartBox unit in the fleet inventory (US28).
 */
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'created']);
const { t } = useI18n();
const telemetryStore = useTelemetryStore();

const formFactorOptions = computed(() => [
  { label: t('telemetry.create.model-20l'), value: 'StandardBox_20L' },
  { label: t('telemetry.create.model-5l'), value: 'SmallBox_5L' }
]);

const serialNumber = ref('');
const formFactor = ref('StandardBox_20L');
const tareWeightKg = ref(10);
const initialTemperature = ref(4);
const minTemp = ref(ThermalThresholds.DEFAULT_MIN_CELSIUS);
const maxTemp = ref(ThermalThresholds.DEFAULT_MAX_CELSIUS);
const warningTemp = ref(ThermalThresholds.DEFAULT_WARNING_CELSIUS);
const excursionToleranceSeconds = ref(ThermalThresholds.DEFAULT_EXCURSION_TOLERANCE_SECONDS);
const errorMessage = ref('');
const isSubmitting = ref(false);

function resetForm() {
  serialNumber.value = '';
  formFactor.value = 'StandardBox_20L';
  tareWeightKg.value = 10;
  initialTemperature.value = 4;
  minTemp.value = ThermalThresholds.DEFAULT_MIN_CELSIUS;
  maxTemp.value = ThermalThresholds.DEFAULT_MAX_CELSIUS;
  warningTemp.value = ThermalThresholds.DEFAULT_WARNING_CELSIUS;
  excursionToleranceSeconds.value = ThermalThresholds.DEFAULT_EXCURSION_TOLERANCE_SECONDS;
  errorMessage.value = '';
  isSubmitting.value = false;
}

watch(() => props.visible, (isOpen) => {
  if (isOpen) resetForm();
});

watch(formFactor, (nextFactor) => {
  if (nextFactor === 'SmallBox_5L' && tareWeightKg.value === 10) {
    tareWeightKg.value = 4.5;
  } else if (nextFactor === 'StandardBox_20L' && tareWeightKg.value === 4.5) {
    tareWeightKg.value = 10;
  }
});

const canSubmit = computed(() => Boolean(serialNumber.value.trim()) && !isSubmitting.value);

function validateAndBuildCommand() {
  const normalizedSerial = serialNumber.value.trim().toUpperCase();
  if (!normalizedSerial) {
    errorMessage.value = t('telemetry.create.errors.serial-required');
    return null;
  }
  if (normalizedSerial.length > CreateSmartContainerCommand.MAX_SERIAL_LENGTH) {
    errorMessage.value = t('telemetry.create.errors.serial-too-long', { max: CreateSmartContainerCommand.MAX_SERIAL_LENGTH });
    return null;
  }
  if (telemetryStore.containers.some(c => String(c.serialNumber || '').toUpperCase() === normalizedSerial)) {
    errorMessage.value = t('telemetry.create.errors.duplicate-serial', { serial: normalizedSerial });
    return null;
  }
  if (tareWeightKg.value === null || Number.isNaN(Number(tareWeightKg.value)) || Number(tareWeightKg.value) < 0) {
    errorMessage.value = t('telemetry.create.errors.tare-invalid');
    return null;
  }
  if (initialTemperature.value === null || Number.isNaN(Number(initialTemperature.value))) {
    errorMessage.value = t('telemetry.create.errors.temp-invalid');
    return null;
  }
  if (!excursionToleranceSeconds.value || Number(excursionToleranceSeconds.value) <= 0) {
    errorMessage.value = t('telemetry.create.errors.tolerance-invalid');
    return null;
  }

  try {
    return new CreateSmartContainerCommand({
      serialNumber: normalizedSerial,
      formFactor: formFactor.value,
      tareWeightKg: tareWeightKg.value,
      initialTemperature: initialTemperature.value,
      minTemp: minTemp.value,
      maxTemp: maxTemp.value,
      warningTemp: warningTemp.value,
      excursionToleranceSeconds: excursionToleranceSeconds.value
    });
  } catch {
    errorMessage.value = t('telemetry.rules.invalid');
    return null;
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  const command = validateAndBuildCommand();
  if (!command) return;

  isSubmitting.value = true;
  try {
    const created = await telemetryStore.createContainer(command);
    emit('created', created);
    emit('update:visible', false);
  } catch (error) {
    if (error?.response?.status === 409) {
      errorMessage.value = t('telemetry.create.errors.duplicate-serial', { serial: command.serialNumber });
    } else {
      errorMessage.value = t('telemetry.create.errors.submit-failed');
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :closable="true"
    :dismissable-mask="true"
    :style="{ width: '560px', maxWidth: '95vw' }"
    class="create-container-dialog"
    :aria-label="t('telemetry.create.title')"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div>
        <span class="breadcrumb-text text-xs text-muted block mb-1">{{ t('telemetry.create.breadcrumb') }}</span>
        <h2 class="text-xl font-bold text-main m-0">{{ t('telemetry.create.title') }}</h2>
        <p class="text-xs text-muted mt-1 mb-0">{{ t('telemetry.create.subtitle') }}</p>
      </div>
    </template>

    <form class="flex flex-column gap-3 py-2" @submit.prevent="handleSubmit">
      <div class="grid m-0 gap-3">
        <div class="col-12 md:col p-0">
          <label for="create-serial-input" class="block text-xs font-bold text-muted mb-1">
            {{ t('telemetry.create.serial-label') }}
          </label>
          <pv-input-text
            id="create-serial-input"
            v-model="serialNumber"
            maxlength="30"
            class="w-full uppercase-input"
            :placeholder="t('telemetry.create.serial-placeholder')"
            autocomplete="off"
            aria-required="true"
          />
          <small class="text-2xs text-muted block mt-1">{{ t('telemetry.create.serial-hint') }}</small>
        </div>

        <div class="col-12 md:col p-0">
          <label for="create-form-factor" class="block text-xs font-bold text-muted mb-1">
            {{ t('telemetry.create.model-label') }}
          </label>
          <pv-select
            v-model="formFactor"
            input-id="create-form-factor"
            :options="formFactorOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid m-0 gap-3">
        <div class="col-12 sm:col p-0">
          <label for="create-tare-weight" class="block text-xs font-bold text-muted mb-1">
            {{ t('telemetry.create.tare-label') }}
          </label>
          <pv-input-number
            v-model="tareWeightKg"
            input-id="create-tare-weight"
            :min-fraction-digits="1"
            :max-fraction-digits="2"
            :min="0"
            :max="100"
            suffix=" kg"
            class="w-full"
          />
        </div>

        <div class="col-12 sm:col p-0">
          <label for="create-initial-temp" class="block text-xs font-bold text-muted mb-1">
            {{ t('telemetry.create.initial-temp-label') }}
          </label>
          <pv-input-number
            v-model="initialTemperature"
            input-id="create-initial-temp"
            :min-fraction-digits="1"
            :max-fraction-digits="1"
            :min="-20"
            :max="40"
            suffix=" °C"
            class="w-full"
          />
        </div>
      </div>

      <div class="thresholds-box p-3 border-round-2xl">
        <span class="block text-xs font-bold text-main mb-2">{{ t('telemetry.create.thresholds-title') }}</span>
        <div class="grid m-0 gap-2">
          <div class="col-6 sm:col-3 p-0">
            <label for="create-min-temp" class="block text-2xs font-bold text-muted mb-1">{{ t('telemetry.create.min-short') }}</label>
            <pv-input-number
              v-model="minTemp"
              input-id="create-min-temp"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              :min="-20"
              :max="25"
              suffix=" °C"
              class="w-full"
            />
          </div>

          <div class="col-6 sm:col-3 p-0">
            <label for="create-max-temp" class="block text-2xs font-bold text-muted mb-1">{{ t('telemetry.create.max-short') }}</label>
            <pv-input-number
              v-model="maxTemp"
              input-id="create-max-temp"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              :min="-20"
              :max="30"
              suffix=" °C"
              class="w-full"
            />
          </div>

          <div class="col-6 sm:col-3 p-0">
            <label for="create-warning-temp" class="block text-2xs font-bold text-muted mb-1">{{ t('telemetry.create.warning-short') }}</label>
            <pv-input-number
              v-model="warningTemp"
              input-id="create-warning-temp"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              :min="-20"
              :max="30"
              suffix=" °C"
              class="w-full"
            />
          </div>

          <div class="col-6 sm:col-3 p-0">
            <label for="create-tolerance" class="block text-2xs font-bold text-muted mb-1">{{ t('telemetry.create.tolerance-short') }}</label>
            <pv-input-number
              v-model="excursionToleranceSeconds"
              input-id="create-tolerance"
              :use-grouping="false"
              :min="10"
              :max="3600"
              suffix=" s"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <p v-if="errorMessage" class="text-xs m-0 text-red-600 font-medium" role="alert">
        {{ errorMessage }}
      </p>

      <div class="flex justify-content-end align-items-center gap-2 pt-2">
        <pv-button
          type="button"
          :label="t('telemetry.action.cancel')"
          text
          class="btn-cancel px-4 py-2 text-xs border-round-pill"
          @click="emit('update:visible', false)"
        />
        <pv-button
          type="submit"
          :label="t('telemetry.create.submit')"
          icon="pi pi-plus"
          class="btn-confirm px-4 py-2 text-xs border-round-pill font-bold"
          :loading="isSubmitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </pv-dialog>
</template>

<style scoped>
:deep(.p-dialog) {
  border-radius: 24px;
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
  box-shadow: 0 20px 40px rgba(16, 49, 47, 0.12);
}

.text-main {
  color: #10312F;
}

.text-muted {
  color: #5A706A;
}

.text-2xs {
  font-size: 0.7rem;
}

.uppercase-input {
  text-transform: uppercase;
}

.thresholds-box {
  background-color: #F4F8F6;
  border: 1px solid #E2EBE7;
}

.btn-cancel {
  color: #5A706A !important;
}

.btn-confirm {
  background-color: #0F7A70 !important;
  border: 1px solid #0F7A70 !important;
  color: #FFFFFF !important;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #0B5C55 !important;
  border-color: #0B5C55 !important;
}
</style>
