<script setup>
import { computed } from 'vue';

const props = defineProps({
  incident: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['acknowledge', 'resolve']);

const severityLabel = computed(() => ({
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media'
}[props.incident.severity] ?? props.incident.severity));

const typeLabel = computed(() => ({
  thermal_excursion: 'Excursión térmica',
  power_loss: 'Desconexión 12V',
  unauthorized_opening: 'Apertura no autorizada',
  weight_anomaly: 'Anomalía ponderal'
}[props.incident.type] ?? props.incident.type));

const detectedTime = computed(() => new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(props.incident.detectedAt)));
</script>

<template>
  <article class="incident-card" :class="`severity-${incident.severity}`">
    <div class="flex justify-content-between align-items-start gap-3">
      <div>
        <div class="flex align-items-center flex-wrap gap-2 mb-2">
          <span class="severity-badge">{{ severityLabel }}</span>
          <span class="incident-code">{{ incident.code }}</span>
        </div>
        <h3 class="text-lg">{{ typeLabel }}</h3>
        <p class="description">{{ incident.description }}</p>
      </div>
      <i class="pi pi-exclamation-triangle alert-icon"></i>
    </div>

    <div class="incident-metadata">
      <div><span>SmartBox</span><strong>{{ incident.containerId }}</strong></div>
      <div><span>Orden</span><strong>{{ incident.transportOrder }}</strong></div>
      <div v-if="incident.temperature !== null"><span>Temperatura</span><strong>{{ incident.temperature }} °C</strong></div>
      <div><span>Detectada</span><strong>{{ detectedTime }}</strong></div>
    </div>

    <div v-if="incident.triggersPreArrivalNotice" class="hospital-notice">
      <i class="pi pi-building"></i>
      <div>
        <strong>Aviso pre-arribo activado</strong>
        <span>{{ incident.hospital }} · ETA {{ incident.etaMinutes }} min</span>
      </div>
    </div>

    <div class="actions">
      <button
        v-if="incident.requiresAcknowledgement"
        class="action-button acknowledge-button"
        type="button"
        @click="emit('acknowledge', incident.id)"
      >
        <i class="pi pi-check"></i>
        Acusar recibo
      </button>
      <span v-else class="acknowledged-label">
        <i class="pi pi-check-circle"></i> Alerta reconocida
      </span>
      <button class="action-button resolve-button" type="button" @click="emit('resolve', incident)">
        Atender incidente
      </button>
    </div>
  </article>
</template>

<style scoped>
.incident-card {
  background: #fff;
  border: 1px solid var(--border-subtle);
  border-left: 5px solid var(--color-alert-amber);
  border-radius: 14px;
  padding: 1.1rem;
  box-shadow: 0 4px 14px rgba(16, 49, 47, 0.06);
}

.severity-critical { border-left-color: var(--color-alert-red); }
.severity-high { border-left-color: var(--color-alert-amber); }
.severity-medium { border-left-color: #d3b735; }

.severity-badge {
  padding: .2rem .55rem;
  border-radius: 999px;
  color: #fff;
  background: var(--color-alert-red);
  font-size: .68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.severity-high .severity-badge { background: var(--color-alert-amber); }
.severity-medium .severity-badge { background: #a68d18; }
.incident-code { color: var(--text-secondary); font: 700 .72rem monospace; }
.alert-icon { color: var(--color-alert-red); font-size: 1.35rem; }
.description { color: var(--text-secondary); font-size: .82rem; margin: .45rem 0 1rem; }

.incident-metadata {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .65rem;
  padding: .8rem;
  border-radius: 10px;
  background: #f7f8f4;
}
.incident-metadata div { display: flex; flex-direction: column; gap: .1rem; }
.incident-metadata span { color: var(--text-secondary); font-size: .66rem; text-transform: uppercase; }
.incident-metadata strong { font-size: .77rem; color: var(--text-main); }

.hospital-notice {
  display: flex;
  gap: .65rem;
  margin-top: .8rem;
  padding: .75rem;
  border-radius: 10px;
  color: #24513b;
  background: #eaf5df;
  font-size: .75rem;
}
.hospital-notice div { display: flex; flex-direction: column; }

.actions { display: flex; align-items: center; justify-content: space-between; gap: .7rem; margin-top: 1rem; }
.action-button { border: 0; border-radius: 999px; padding: .55rem .8rem; cursor: pointer; font-size: .73rem; font-weight: 700; }
.acknowledge-button { background: #e9f2ee; color: var(--color-brand-teal); }
.resolve-button { background: var(--color-brand-dark); color: #fff; margin-left: auto; }
.acknowledged-label { color: var(--color-brand-teal); font-size: .72rem; font-weight: 700; }

@media (max-width: 560px) {
  .incident-metadata { grid-template-columns: 1fr; }
  .actions { align-items: stretch; flex-direction: column; }
  .resolve-button { margin-left: 0; }
}
</style>
