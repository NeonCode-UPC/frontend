<script setup>
import EmptyState from './empty-state.vue';

defineProps({
  value: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  paginator: {
    type: Boolean,
    default: true
  },
  rows: {
    type: Number,
    default: 10
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20]
  },
  minWidth: {
    type: String,
    default: '100%'
  },
  emptyTitle: {
    type: String,
    default: 'No se encontraron registros'
  },
  emptyMessage: {
    type: String,
    default: 'Intenta con otro término o filtro de búsqueda.'
  },
  emptyIcon: {
    type: String,
    default: 'pi pi-folder-open'
  },
  rowHover: {
    type: Boolean,
    default: true
  }
});

defineEmits(['row-click', 'row-select', 'update:selection']);
</script>

<template>
  <div class="app-data-table-wrapper w-full overflow-hidden">
    <!-- Estado de carga -->
    <div v-if="loading" class="table-loading-state flex flex-column align-items-center justify-content-center p-6">
      <i class="pi pi-spin pi-spinner text-2xl mb-2 text-teal"></i>
      <span class="text-xs text-muted font-medium">Cargando información médica...</span>
    </div>

    <!-- Tabla PrimeVue estilizada -->
    <pv-data-table
      v-else
      :value="value"
      :paginator="paginator && value.length > 0"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      responsive-layout="scroll"
      :row-hover="rowHover"
      :table-style="{ minWidth }"
      class="app-medical-table"
      @row-click="$emit('row-click', $event)"
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>

      <!-- Columnas inyectadas vía slot default -->
      <slot />

      <!-- Estado Vacío -->
      <template #empty>
        <slot name="empty">
          <empty-state
            :icon="emptyIcon"
            :title="emptyTitle"
            :message="emptyMessage"
          />
        </slot>
      </template>
    </pv-data-table>
  </div>
</template>

<style scoped>
.app-data-table-wrapper {
  background-color: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-radius: 16px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.table-loading-state {
  min-height: 180px;
  background-color: var(--bg-card, #FFFFFF);
}

.text-teal {
  color: var(--color-brand-teal, #0F7A70);
}

:deep(.app-medical-table) {
  background: #FFFFFF !important;
  border: none;
}

:deep(.app-medical-table .p-datatable-header) {
  background: #FFFFFF !important;
  border: none;
  padding: 1rem 1.25rem;
}

:deep(.app-medical-table .p-datatable-thead > tr > th) {
  background: #FFFFFF !important;
  color: var(--text-secondary, #5A706A) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid var(--border-subtle, #E8E6DF) !important;
  padding: 1rem 1.25rem !important;
}

:deep(.app-medical-table .p-datatable-thead > tr > th:hover),
:deep(.app-medical-table .p-datatable-thead > tr > th:focus) {
  background: #FFFFFF !important;
  color: var(--text-main, #10312F) !important;
  outline: none !important;
}

:deep(.app-medical-table .p-datatable-column-title) {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  color: var(--text-secondary, #5A706A) !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
}

:deep(.app-medical-table .p-datatable-sort-icon) {
  display: none !important;
}

:deep(.app-medical-table .p-datatable-column-header-content) {
  display: flex !important;
  align-items: center !important;
  gap: 0.35rem !important;
}

:deep(.app-medical-table .p-datatable-tbody > tr) {
  background: #FFFFFF !important;
  transition: background-color 0.12s ease !important;
  cursor: pointer;
}

:deep(.app-medical-table .p-datatable-tbody > tr:hover) {
  background: #F8FAF9 !important;
}

:deep(.app-medical-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #F0EFEA !important;
  padding: 1.15rem 1.25rem !important;
  font-size: 0.875rem !important;
  color: var(--text-main, #10312F) !important;
  vertical-align: middle !important;
}

:deep(.app-medical-table .p-datatable-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

:deep(.app-medical-table .p-paginator) {
  background: #FFFFFF !important;
  border-top: 1px solid var(--border-subtle, #E8E6DF) !important;
  padding: 0.75rem 1.25rem !important;
  font-size: 0.8125rem !important;
}
</style>
