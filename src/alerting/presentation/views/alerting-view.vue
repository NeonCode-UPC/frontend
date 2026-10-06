<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
import IncidentCard from '../components/incident-card.vue';
import { useAlertingStore } from '../../application/alerting.store.js';

const store = useAlertingStore();
const toast = useToast();
const selectedIncident = ref(null);
const resolution = ref('');
const resolving = ref(false);

const criticalCount = computed(() => store.activeIncidents.filter(item => item.severity === 'critical').length);
const preArrivalCount = computed(() => store.activeIncidents.filter(item => item.triggersPreArrivalNotice).length);

onMounted(() => store.fetchIncidents());

async function acknowledge(id) {
  try {
    await store.acknowledgeIncident(id);
    toast.add({ severity: 'success', summary: 'Acuse registrado', detail: 'La central recibió la confirmación de la tripulación.', life: 3500 });
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo registrar', detail: 'Verifica que el servidor mock esté activo.', life: 3500 });
  }
}

function openResolution(incident) {
  selectedIncident.value = incident;
  resolution.value = '';
}

async function confirmResolution() {
  if (!resolution.value.trim()) return;
  resolving.value = true;
  try {
    await store.resolveIncident(selectedIncident.value.id, resolution.value.trim());
    selectedIncident.value = null;
    toast.add({ severity: 'success', summary: 'Incidente atendido', detail: 'Se actualizó el historial de contingencias.', life: 3500 });
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudo actualizar', detail: 'Verifica que el servidor mock esté activo.', life: 3500 });
  } finally {
    resolving.value = false;
  }
}
</script>

<template>
  <base-screen
    title="Alertas críticas"
    bounded-context="Critical Alerting & Incident Response"
    search-placeholder="Filtrar por código, SmartBox u orden..."
  >
    <template #default="{ searchQuery }">
      <div class="dashboard">
        <section class="summary-grid">
          <div class="summary-card danger"><span>Incidentes activos</span><strong>{{ store.activeIncidents.length }}</strong></div>
          <div class="summary-card"><span>Severidad crítica</span><strong>{{ criticalCount }}</strong></div>
          <div class="summary-card"><span>Acuses pendientes</span><strong>{{ store.pendingAcknowledgements }}</strong></div>
          <div class="summary-card success"><span>Avisos pre-arribo</span><strong>{{ preArrivalCount }}</strong></div>
        </section>

        <div class="section-heading">
          <div>
            <h2>Centro de respuesta inmediata</h2>
            <p>Confirma cada alerta en menos de 2 minutos y coordina el plan de contingencia.</p>
          </div>
          <router-link to="/alerting/incidents" class="history-link">Ver historial <i class="pi pi-arrow-right"></i></router-link>
        </div>

        <div v-if="store.loading" class="state-message"><i class="pi pi-spin pi-spinner"></i> Cargando alertas...</div>
        <div v-else-if="store.error" class="state-message error-message">{{ store.error }}</div>
        <div v-else-if="!store.activeIncidents.length" class="state-message safe-message"><i class="pi pi-check-circle"></i> No hay incidentes activos.</div>
        <div v-else class="incident-grid">
          <incident-card
            v-for="incident in store.activeIncidents.filter(item => !searchQuery || [item.code, item.containerId, item.transportOrder, item.description].join(' ').toLowerCase().includes(searchQuery.toLowerCase()))"
            :key="incident.id"
            :incident="incident"
            @acknowledge="acknowledge"
            @resolve="openResolution"
          />
        </div>
      </div>
    </template>
  </base-screen>

  <pv-dialog :visible="Boolean(selectedIncident)" @update:visible="value => { if (!value) selectedIncident = null }" modal header="Registrar resolución" :style="{ width: 'min(92vw, 520px)' }">
    <p class="dialog-copy">Describe la acción aplicada. Esta información formará parte del reporte de desviación de cadena de frío.</p>
    <pv-textarea v-model="resolution" rows="5" fluid placeholder="Ej.: Se reemplazó la fuente de energía y se verificó la estabilidad térmica..." />
    <template #footer>
      <pv-button label="Cancelar" severity="secondary" text @click="selectedIncident = null" />
      <pv-button label="Cerrar incidente" :loading="resolving" :disabled="!resolution.trim()" @click="confirmResolution" />
    </template>
  </pv-dialog>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 1.25rem; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.summary-card { display: flex; flex-direction: column; gap: .25rem; padding: .9rem 1rem; border: 1px solid #e5e5dc; border-radius: 12px; background: #f8f8f4; }
.summary-card span { color: var(--text-secondary); font-size: .7rem; }
.summary-card strong { font-size: 1.65rem; color: var(--color-brand-dark); }
.summary-card.danger strong { color: var(--color-alert-red); }
.summary-card.success strong { color: var(--color-brand-teal); }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.section-heading h2 { font-size: 1rem; }
.section-heading p, .dialog-copy { margin: .2rem 0 0; color: var(--text-secondary); font-size: .76rem; }
.history-link { color: var(--color-brand-teal); font-size: .75rem; font-weight: 700; white-space: nowrap; }
.incident-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.state-message { padding: 2rem; text-align: center; color: var(--text-secondary); border: 1px dashed var(--border-subtle); border-radius: 12px; }
.error-message { color: var(--color-alert-red); background: #fff5f3; }
.safe-message { color: var(--color-brand-teal); background: #f2f8ee; }
@media (max-width: 980px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } .incident-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .summary-grid { grid-template-columns: 1fr; } .section-heading { align-items: start; flex-direction: column; } }
</style>
