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
          <status-badge :status="incident.status" />
          <span class="severity-badge">{{ severityLabel }}</span>
          <span class="incident-code">{{ incident.code }}</span>
        </div>
        <h3 class="incident-title text-base md:text-lg font-bold text-main m-0">{{ typeLabel }}</h3>
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
      <i class="pi pi-building text-base"></i>
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
        <span>Acusar recibo</span>
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
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-left: 4px solid var(--color-alert-amber, #E89332);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(16, 49, 47, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease-in-out;
}

.incident-card:hover {
  box-shadow: 0 4px 12px rgba(16, 49, 47, 0.08);
}

.severity-critical { border-left-color: var(--color-alert-red, #E05A46); }
.severity-high { border-left-color: var(--color-alert-amber, #E89332); }
.severity-medium { border-left-color: #D97706; }

.severity-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  color: #FFFFFF;
  background: var(--color-alert-red, #E05A46);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.severity-high .severity-badge { background: var(--color-alert-amber, #E89332); }
.severity-medium .severity-badge { background: #D97706; }

.incident-code {
  color: var(--text-secondary, #5A706A);
  font: 700 0.75rem monospace;
}

.alert-icon {
  color: var(--color-alert-red, #E05A46);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.description {
  color: var(--text-secondary, #5A706A);
  font-size: 0.8125rem;
  margin: 0.5rem 0 1rem;
  line-height: 1.4;
}

.incident-metadata {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: var(--bg-card-subtle, #F9F8F5);
  border: 1px solid var(--border-subtle, #E8E6DF);
}

.incident-metadata div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.incident-metadata span {
  color: var(--text-muted, #8C9E99);
  font-size: 0.6875rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.incident-metadata strong {
  font-size: 0.8125rem;
  color: var(--text-main, #10312F);
  font-weight: 600;
}

.hospital-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: var(--color-brand-dark, #10312F);
  background: var(--color-brand-mint-subtle, #EAF7EE);
  border: 1px solid var(--color-brand-mint, #B9DDA0);
  font-size: 0.75rem;
}

.hospital-notice div {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.hospital-notice strong {
  font-weight: 600;
  color: var(--color-brand-dark, #10312F);
}

.hospital-notice span {
  color: var(--text-secondary, #5A706A);
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle, #E8E6DF);
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid transparent;
  border-radius: 9999px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.acknowledge-button {
  background: var(--color-brand-mint-subtle, #EAF7EE);
  color: var(--color-brand-teal, #0F7A70);
  border-color: var(--color-brand-mint, #B9DDA0);
}

.acknowledge-button:hover {
  background: #DCFCE7;
}

.resolve-button {
  background: var(--color-brand-teal, #0F7A70);
  color: #FFFFFF;
  margin-left: auto;
}

.resolve-button:hover {
  background: var(--color-brand-teal-hover, #0B6258);
}

.acknowledged-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-brand-teal, #0F7A70);
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 560px) {
  .incident-metadata {
    grid-template-columns: 1fr;
  }
  .actions {
    align-items: stretch;
    flex-direction: column;
  }
  .resolve-button {
    margin-left: 0;
  }
}
</style>
