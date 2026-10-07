<script setup>
defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar'
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar'
  },
  confirmSeverity: {
    type: String,
    default: 'primary'
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '520px'
  },
  dismissableMask: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

function handleClose() {
  emit('update:visible', false);
  emit('cancel');
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    :dismissable-mask="dismissableMask"
    :style="{ width: `min(94vw, ${width})` }"
    class="action-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="dialog-header flex flex-column gap-1">
        <h3 class="m-0 text-lg font-bold text-main">{{ title }}</h3>
        <p v-if="subtitle" class="m-0 text-xs text-muted">{{ subtitle }}</p>
      </div>
    </template>

    <div class="dialog-body py-2">
      <slot />
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex justify-content-end align-items-center gap-2 w-full pt-2">
          <pv-button
            :label="cancelLabel"
            severity="secondary"
            text
            class="border-round-pill"
            @click="handleClose"
          />
          <pv-button
            :label="confirmLabel"
            :severity="confirmSeverity"
            :loading="loading"
            :disabled="confirmDisabled"
            class="border-round-pill"
            @click="emit('confirm')"
          />
        </div>
      </slot>
    </template>
  </pv-dialog>
</template>

<style scoped>
.dialog-header {
  width: 100%;
}
</style>
