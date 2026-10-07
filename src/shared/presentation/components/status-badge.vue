<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  dot: {
    type: Boolean,
    default: true
  }
});

const normalizedStatus = computed(() => {
  const s = (props.status || '').toLowerCase().trim();
  if (['activo', 'active', 'online', 'en línea', 'disponible', 'available', 'resolved', 'resuelto', 'completed', 'completados'].includes(s)) {
    return 'success';
  }
  if (['en ruta', 'en tránsito', 'in-transit', 'intransit', 'transit', 'route', 'assigned', 'asignados', 'asignado'].includes(s)) {
    return 'info';
  }
  if (['mantenimiento', 'maintenance', 'pendiente', 'pending', 'pendientes', 'warning', 'advertencia'].includes(s)) {
    return 'warning';
  }
  if (['alerta', 'alert', 'crítico', 'critico', 'critical', 'excursión', 'excursion', 'danger', 'peligro', 'exception'].includes(s)) {
    return 'danger';
  }
  if (['cerrada', 'closed', 'inactivo', 'inactive'].includes(s)) {
    return 'neutral';
  }
  return 'default';
});

const displayLabel = computed(() => {
  if (props.label) return props.label;
  const s = props.status;
  // If original status already has standard casing, return it
  if (s) return s;
  return 'Estado';
});
</script>

<template>
  <span :class="['status-badge-pill', `badge-${normalizedStatus}`]">
    <span v-if="dot" class="status-dot"></span>
    <span class="status-text">{{ displayLabel }}</span>
  </span>
</template>

<style scoped>
.status-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.6875rem; /* 11px */
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Success / Mint */
.badge-success {
  background-color: var(--color-brand-mint-subtle, #EAF7EE);
  color: var(--color-brand-dark, #10312F);
  border: 1px solid var(--color-brand-mint, #B9DDA0);
}
.badge-success .status-dot {
  background-color: #2E7D32;
}

/* Info / In-Transit Blue */
.badge-info {
  background-color: var(--color-info-blue-subtle, #EFF6FF);
  color: var(--color-info-blue, #1E40AF);
  border: 1px solid #BFDBFE;
}
.badge-info .status-dot {
  background-color: #2563EB;
}

/* Warning / Amber */
.badge-warning {
  background-color: var(--color-alert-amber-subtle, #FFFBEB);
  color: #92400E;
  border: 1px solid #FDE68A;
}
.badge-warning .status-dot {
  background-color: var(--color-alert-amber, #E89332);
}

/* Danger / Alert Red */
.badge-danger {
  background-color: var(--color-alert-red-subtle, #FEF2F2);
  color: #991B1B;
  border: 1px solid var(--color-alert-red-border, #FECACA);
}
.badge-danger .status-dot {
  background-color: var(--color-alert-red, #E05A46);
}

/* Neutral / Closed */
.badge-neutral, .badge-default {
  background-color: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}
.badge-neutral .status-dot, .badge-default .status-dot {
  background-color: #9CA3AF;
}
</style>
