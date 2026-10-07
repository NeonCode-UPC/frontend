<script setup>
import { computed, onMounted } from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useAlertingStore } from '../../application/alerting.store.js';

const store = useAlertingStore();
const { searchQuery } = useLayoutHeader();

onMounted(() => {
  if (!store.incidents.length) store.fetchIncidents();
});

function formatDate(value) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

const filteredIncidents = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  const list = [...store.incidents].sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
  if (!query) return list;
  return list.filter(item =>
    item.code?.toLowerCase().includes(query) ||
    item.type?.toLowerCase().includes(query) ||
    item.containerId?.toLowerCase().includes(query) ||
    item.transportOrder?.toLowerCase().includes(query) ||
    item.resolution?.toLowerCase().includes(query)
  );
});
</script>

<template>
  <base-screen
    breadcrumb="Alertas / Historial"
    title="Historial de incidentes"
    subtitle="Evidencia auditable de alertas, acuses y acciones correctivas"
    :fluid="true"
    search-placeholder="Filtrar por incidente, tipo o resolución..."
  >
    <template #actions>
      <router-link
        to="/alerting"
        class="p-button p-button-outlined p-button-sm border-round-pill flex align-items-center gap-2"
      >
        <i class="pi pi-arrow-left"></i>
        <span>Volver a alertas</span>
      </router-link>
    </template>

    <div v-if="store.error" class="history-state error mb-3">
      {{ store.error }}
    </div>

    <app-data-table
      :value="filteredIncidents"
      :loading="store.loading"
      :rows="10"
      :rows-per-page-options="[5, 10, 20]"
      min-width="55rem"
      empty-title="No se encontraron incidentes"
      empty-message="No hay incidentes registrados en el historial técnico-sanitario."
    >
      <!-- Columna: INCIDENTE -->
      <pv-column field="code" header="INCIDENTE">
        <template #body="{ data }">
          <div class="flex flex-column">
            <strong class="text-main font-semibold text-sm">{{ data.code }}</strong>
            <small class="text-muted text-xs capitalize">{{ data.severity }}</small>
          </div>
        </template>
      </pv-column>

      <!-- Columna: TIPO -->
      <pv-column field="type" header="TIPO">
        <template #body="{ data }">
          <span class="text-main font-medium text-sm capitalize">
            {{ data.type.replaceAll('_', ' ') }}
          </span>
        </template>
      </pv-column>

      <!-- Columna: SMARTBOX / ORDEN -->
      <pv-column field="containerId" header="SMARTBOX / ORDEN">
        <template #body="{ data }">
          <div class="flex flex-column">
            <strong class="text-main font-semibold text-sm">{{ data.containerId }}</strong>
            <small class="text-muted text-xs">{{ data.transportOrder }}</small>
          </div>
        </template>
      </pv-column>

      <!-- Columna: DETECCIÓN -->
      <pv-column field="detectedAt" header="DETECCIÓN">
        <template #body="{ data }">
          <span class="text-secondary text-sm white-space-nowrap">
            {{ formatDate(data.detectedAt) }}
          </span>
        </template>
      </pv-column>

      <!-- Columna: ESTADO -->
      <pv-column field="status" header="ESTADO">
        <template #body="{ data }">
          <status-badge :status="data.status" />
        </template>
      </pv-column>

      <!-- Columna: RESOLUCIÓN -->
      <pv-column field="resolution" header="RESOLUCIÓN">
        <template #body="{ data }">
          <span class="text-secondary text-xs line-height-3 block" style="max-width: 320px">
            {{ data.resolution || 'Pendiente de cierre y emisión de informe' }}
          </span>
        </template>
      </pv-column>
    </app-data-table>
  </base-screen>
</template>

<style scoped>
.history-state {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-secondary, #5A706A);
  background-color: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-radius: 12px;
}

.history-state.error {
  color: var(--color-alert-red, #E05A46);
  background-color: var(--color-alert-red-subtle, #FEF2F2);
  border-color: var(--color-alert-red-border, #FECACA);
}

.p-button-outlined {
  color: var(--color-brand-teal, #0F7A70);
  border-color: var(--color-brand-teal, #0F7A70);
  font-weight: 600;
  text-decoration: none;
}

.p-button-outlined:hover {
  background-color: var(--color-brand-mint-subtle, #EAF7EE);
}
</style>
