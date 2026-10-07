<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  showSearch: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'clear']);
</script>

<template>
  <div class="filter-bar flex flex-column md:flex-row align-items-stretch md:align-items-center justify-content-between gap-3 w-full">
    <!-- Bloque izquierdo: Búsqueda y Filtros desplegables -->
    <div class="flex flex-column sm:flex-row align-items-stretch sm:align-items-center gap-2 flex-grow-1">
      <pv-icon-field v-if="showSearch" class="search-field w-full sm:w-20rem md:w-24rem">
        <pv-input-icon class="pi pi-search text-muted" />
        <pv-input-text
          :value="modelValue"
          :placeholder="placeholder"
          class="w-full search-pill-input"
          @input="emit('update:modelValue', $event.target.value)"
        />
      </pv-icon-field>

      <div v-if="$slots.filters" class="filters-slot flex flex-wrap align-items-center gap-2">
        <slot name="filters" />
      </div>
    </div>

    <!-- Bloque derecho: Acciones rápidas (Botones, exportación, etc.) -->
    <div v-if="$slots.actions" class="actions-slot flex align-items-center gap-2 flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  width: 100%;
}

.search-pill-input {
  border-radius: 9999px !important;
  padding-left: 2.5rem !important;
  background: var(--bg-card, #FFFFFF) !important;
  border: 1px solid var(--border-subtle, #E8E6DF) !important;
  font-size: 0.8125rem !important;
  color: var(--text-main, #10312F) !important;
  transition: all 0.15s ease;
}

.search-pill-input:focus {
  border-color: var(--color-brand-teal, #0F7A70) !important;
  box-shadow: 0 0 0 2px rgba(15, 122, 112, 0.12) !important;
}

:deep(.p-select.select-pill) {
  border-radius: 9999px !important;
  background: var(--bg-card, #FFFFFF) !important;
  border: 1px solid var(--border-subtle, #E8E6DF) !important;
  font-size: 0.8125rem !important;
}
</style>
