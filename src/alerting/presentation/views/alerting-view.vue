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
    breadcrumb="Alertas"
    title="Centro de alertas críticas"
    subtitle="Despacho menor a 10s vía Push y SMS · 4 indicadores activos"
    :fluid="true"
    search-placeholder="Filtrar por código, SmartBox u orden..."
  >
    <template #actions>
      <router-link to="/alerting/incidents" class="p-button p-button-outlined p-button-sm border-round-pill">
        Ver historial
      </router-link>
    </template>

    <template #default="{ searchQuery }">
      <div class="dashboard">
        <section class="grid mb-2">
          <div class="col-12 sm:col-6 lg:col-3">
            <kpi-card
              :value="store.summary?.activeAlerts ?? store.activeIncidents.length"
              label="Alertas activas"
              accent="red"
            />
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <kpi-card
              :value="store.summary?.unacknowledgedAlerts ?? store.pendingAcknowledgements"
              label="Sin acuse de recibo"
              accent="amber"
            />
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <kpi-card
              :value="store.summary?.averageResponseTime ?? '< 2 min'"
              label="Tiempo medio de respuesta"
              accent="teal"
            />
          </div>
          <div class="col-12 sm:col-6 lg:col-3">
            <kpi-card
              :value="store.summary?.dispatchedPush ?? preArrivalCount"
              label="Notificaciones enviadas"
              accent="mint"
            />
          </div>
        </section>

        <div v-if="store.loading" class="state-message">
          <i class="pi pi-spin pi-spinner mr-2"></i> Cargando alertas...
        </div>
        <div v-else-if="store.error" class="state-message error-message">
          {{ store.error }}
        </div>
        <empty-state
          v-else-if="!store.activeIncidents.length"
          icon="pi pi-check-circle"
          title="No hay incidentes activos"
          message="Todos los contenedores se encuentran operando bajo parámetros normales."
        />
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

  <action-dialog
    :visible="Boolean(selectedIncident)"
    title="Registrar resolución"
    subtitle="Describe la acción aplicada. Esta información formará parte del reporte de desviación de cadena de frío."
    confirm-label="Cerrar incidente"
    :loading="resolving"
    :confirm-disabled="!resolution.trim()"
    @update:visible="value => { if (!value) selectedIncident = null }"
    @confirm="confirmResolution"
    @cancel="selectedIncident = null"
  >
    <pv-textarea
      v-model="resolution"
      rows="5"
      fluid
      placeholder="Ej.: Se reemplazó la fuente de energía y se verificó la estabilidad térmica..."
    />
  </action-dialog>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.incident-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.dialog-copy {
  margin: 0.2rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.state-message {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-radius: 12px;
}

.error-message {
  color: var(--color-alert-red, #E05A46);
  background: var(--color-alert-red-subtle, #FEF2F2);
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

@media (max-width: 980px) {
  .incident-grid {
    grid-template-columns: 1fr;
  }
}
</style>
