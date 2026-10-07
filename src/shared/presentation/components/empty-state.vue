<script setup>
defineProps({
  icon: {
    type: String,
    default: 'pi pi-inbox'
  },
  title: {
    type: String,
    default: 'No se encontraron resultados'
  },
  message: {
    type: String,
    default: ''
  },
  actionLabel: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['action']);
</script>

<template>
  <div class="empty-state-panel flex flex-column align-items-center justify-content-center text-center p-5 border-round-xl">
    <div class="empty-icon-wrap flex align-items-center justify-content-center mb-3">
      <i :class="[icon, 'text-2xl text-muted']"></i>
    </div>
    <h3 class="m-0 text-base font-bold text-main mb-1">
      {{ title }}
    </h3>
    <p v-if="message" class="m-0 text-xs text-muted max-w-26rem line-height-3 mb-3">
      {{ message }}
    </p>
    <slot />
    <pv-button
      v-if="actionLabel"
      :label="actionLabel"
      severity="secondary"
      outlined
      size="small"
      class="border-round-pill mt-2"
      @click="emit('action')"
    />
  </div>
</template>

<style scoped>
.empty-state-panel {
  background-color: var(--bg-card, #FFFFFF);
  border: 1px dashed var(--border-subtle, #E8E6DF);
  min-height: 160px;
}

.empty-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--bg-app, #F6F5EF);
}
</style>
