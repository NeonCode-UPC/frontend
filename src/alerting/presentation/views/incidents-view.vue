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
    title="Historial de incidentes"
    bounded-context="Critical Alerting & Incident Response"
    search-placeholder="Filtrar por incidente, tipo o resolución..."
  >
    <template #default="{ searchQuery }">
      <div class="history-header">
        <div>
          <h2>Registro técnico-sanitario</h2>
          <p>Evidencia auditable de alertas, acuses y acciones correctivas.</p>
        </div>
        <router-link to="/alerting" class="back-link"><i class="pi pi-arrow-left"></i> Volver a alertas</router-link>
      </div>

      <div v-if="store.loading" class="history-state"><i class="pi pi-spin pi-spinner"></i> Cargando historial...</div>
      <div v-else-if="store.error" class="history-state error">{{ store.error }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>Incidente</th><th>Tipo</th><th>SmartBox / Orden</th><th>Detección</th><th>Estado</th><th>Resolución</th></tr></thead>
          <tbody>
            <tr v-for="incident in sortedIncidents.filter(item => !searchQuery || JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))" :key="incident.id">
              <td><strong>{{ incident.code }}</strong><small>{{ incident.severity }}</small></td>
              <td>{{ incident.type.replaceAll('_', ' ') }}</td>
              <td><strong>{{ incident.containerId }}</strong><small>{{ incident.transportOrder }}</small></td>
              <td>{{ formatDate(incident.detectedAt) }}</td>
              <td><span class="status" :class="incident.status">{{ incident.status === 'resolved' ? 'Resuelto' : 'Pendiente' }}</span></td>
              <td>{{ incident.resolution || 'Pendiente de cierre y emisión de informe' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
.history-header { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }
.history-header h2 { font-size: 1rem; }
.history-header p { margin: .2rem 0 0; color: var(--text-secondary); font-size: .76rem; }
.back-link { color: var(--color-brand-teal); font-size: .75rem; font-weight: 700; white-space: nowrap; }
.table-wrap { overflow-x: auto; }
table { width: 100%; min-width: 850px; border-collapse: collapse; font-size: .76rem; }
th { padding: .7rem; text-align: left; color: var(--text-secondary); background: #f5f6f1; font-size: .65rem; text-transform: uppercase; letter-spacing: .04em; }
td { padding: .8rem .7rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); }
td strong, td small { display: block; color: var(--text-main); }
td small { margin-top: .15rem; color: var(--text-secondary); text-transform: capitalize; }
.status { display: inline-block; padding: .2rem .5rem; border-radius: 999px; font-weight: 700; }
.status.pending { color: #a33d2d; background: #ffebe7; }
.status.resolved { color: #24614f; background: #e5f4ec; }
.history-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
.history-state.error { color: var(--color-alert-red); }
@media (max-width: 600px) { .history-header { align-items: start; flex-direction: column; } }
</style>
