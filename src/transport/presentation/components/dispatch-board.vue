<script setup>
import {computed} from 'vue';

const props = defineProps({
  dispatchTrips: {
    type: Array,
    default: () => []
  }
});

const statuses = [
  {
    value: 'Pending',
    label: 'Pendientes'
  },
  {
    value: 'Assigned',
    label: 'Asignados'
  },
  {
    value: 'InTransit',
    label: 'En tránsito'
  },
  {
    value: 'Completed',
    label: 'Completados'
  }
];

const tripsByStatus = computed(() => {
  return statuses.reduce((groups, status) => {
    groups[status.value] = props.dispatchTrips.filter(
        trip => trip.status === status.value
    );

    return groups;
  }, {});
});
</script>

<template>
  <div class="dispatch-board">
    <div
      v-for="status in statuses"
      :key="status.value"
      class="dispatch-column"
    >
      <header class="dispatch-column-header">
        <div>
          <h2 class="column-title">{{ status.label }}</h2>
          <span class="column-subtitle">Despachos</span>
        </div>

        <span class="dispatch-count">
          {{ tripsByStatus[status.value].length }}
        </span>
      </header>

      <div class="dispatch-column-content">
        <article
          v-for="trip in tripsByStatus[status.value]"
          :key="trip.id"
          class="dispatch-card"
        >
          <div class="dispatch-card-top">
            <strong class="trip-id">Viaje #{{ trip.id }}</strong>
            <status-badge :status="trip.status" />
          </div>

          <div class="dispatch-card-info">
            <div class="info-row">
              <span class="info-label">Orden:</span>
              <strong class="info-value">#{{ trip.transportOrderId }}</strong>
            </div>

            <div v-if="trip.ambulanceId" class="info-row">
              <span class="info-label">Ambulancia:</span>
              <strong class="info-value font-mono">{{ trip.ambulanceId }}</strong>
            </div>

            <div v-if="trip.eta !== null" class="info-row">
              <span class="info-label">ETA:</span>
              <strong class="info-value eta-highlight">{{ trip.eta }} min</strong>
            </div>
          </div>
        </article>

        <div
          v-if="tripsByStatus[status.value].length === 0"
          class="empty-column"
        >
          <i class="pi pi-inbox empty-icon"></i>
          <span>Sin despachos</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dispatch-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: start;
}

.dispatch-column {
  min-width: 0;
  background: #FFFFFF;
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-radius: 14px;
  padding: 1.25rem 1rem;
  box-shadow: 0 1px 3px rgba(16, 49, 47, 0.04);
  display: flex;
  flex-direction: column;
}

.dispatch-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
}

.column-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main, #10312F);
  letter-spacing: -0.01em;
}

.column-subtitle {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary, #5A706A);
  font-weight: 500;
  margin-top: 0.15rem;
}

.dispatch-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-brand-teal, #0F7A70);
  color: var(--text-inverse, #FFFFFF);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.dispatch-column-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-height: 140px;
}

.dispatch-card {
  background: var(--bg-card-subtle, #F9F8F5);
  border: 1px solid var(--border-subtle, #E8E6DF);
  border-radius: 10px;
  padding: 0.9rem;
  box-shadow: 0 1px 2px rgba(16, 49, 47, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all 0.2s ease-in-out;
}

.dispatch-card:hover {
  background: #FFFFFF;
  border-color: var(--border-hover, #0F7A70);
  box-shadow: 0 4px 12px rgba(16, 49, 47, 0.08);
  transform: translateY(-2px);
}

.dispatch-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.trip-id {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main, #10312F);
}

.dispatch-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle, #E8E6DF);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.info-label {
  color: var(--text-secondary, #5A706A);
  font-weight: 500;
}

.info-value {
  color: var(--text-main, #10312F);
  font-weight: 600;
}

.eta-highlight {
  color: var(--color-brand-teal, #0F7A70);
  font-weight: 700;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 1.5rem 1rem;
  border: 1px dashed var(--border-subtle, #E8E6DF);
  border-radius: 10px;
  background: rgba(246, 245, 239, 0.4);
  color: var(--text-muted, #8C9E99);
  font-size: 0.8125rem;
  text-align: center;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 1.25rem;
  color: var(--text-muted, #8C9E99);
}

@media (max-width: 1200px) {
  .dispatch-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dispatch-board {
    grid-template-columns: 1fr;
  }
}
</style>