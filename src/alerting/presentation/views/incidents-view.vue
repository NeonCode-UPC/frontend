<script setup>
import { computed, onMounted } from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
import { useAlertingStore } from '../../application/alerting.store.js';

const store = useAlertingStore();

onMounted(() => {
  if (!store.incidents.length) store.fetchIncidents();
});

function formatDate(value) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

const sortedIncidents = computed(() => [...store.incidents].sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt)));
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

    <template #default="{ searchQuery }">
      <div v-if="store.loading" class="history-state">
        <i class="pi pi-spin pi-spinner mr-2"></i> Cargando historial...
      </div>
      <div v-else-if="store.error" class="history-state error">
        {{ store.error }}
      </div>
      <empty-state
        v-else-if="!sortedIncidents.length"
        icon="pi pi-history"
        title="No se encontraron incidentes"
        message="No hay incidentes registrados en el historial técnico-sanitario."
      />
      <content-card v-else padding="p-0" class="overflow-hidden">
        <div class="table-wrap">
          <table class="incidents-table">
            <thead>
              <tr>
                <th>Incidente</th>
                <th>Tipo</th>
                <th>SmartBox / Orden</th>
                <th>Detección</th>
                <th>Estado</th>
                <th>Resolución</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="incident in sortedIncidents.filter(item => !searchQuery || JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))"
                :key="incident.id"
              >
                <td>
                  <strong class="text-main">{{ incident.code }}</strong>
                  <small class="text-muted">{{ incident.severity }}</small>
                </td>
                <td class="type-cell">{{ incident.type.replaceAll('_', ' ') }}</td>
                <td>
                  <strong class="text-main">{{ incident.containerId }}</strong>
                  <small class="text-muted">{{ incident.transportOrder }}</small>
                </td>
                <td class="date-cell">{{ formatDate(incident.detectedAt) }}</td>
                <td>
                  <status-badge :status="incident.status" />
                </td>
                <td class="resolution-cell">{{ incident.resolution || 'Pendiente de cierre y emisión de informe' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </content-card>
    </template>
  </base-screen>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  width: 100%;
}

.incidents-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  font-size: 0.8125rem;
  text-align: left;
}

.incidents-table th {
  padding: 0.85rem 1rem;
  background-color: var(--bg-card-subtle, #F9F8F5);
  color: var(--text-secondary, #5A706A);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
  white-space: nowrap;
}

.incidents-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
  color: var(--text-secondary, #5A706A);
  vertical-align: middle;
}

.incidents-table tbody tr:last-child td {
  border-bottom: none;
}

.incidents-table tbody tr:hover {
  background-color: var(--bg-card-subtle, #F9F8F5);
}

.incidents-table td strong {
  display: block;
  font-weight: 600;
  color: var(--text-main, #10312F);
}

.incidents-table td small {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.15rem;
  color: var(--text-secondary, #5A706A);
  text-transform: capitalize;
}

.type-cell {
  text-transform: capitalize;
  font-weight: 500;
  color: var(--text-main, #10312F);
}

.date-cell {
  white-space: nowrap;
}

.resolution-cell {
  max-width: 320px;
  line-height: 1.4;
}

.history-state {
  padding: 3rem 2rem;
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
