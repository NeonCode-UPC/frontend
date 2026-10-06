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
      <div class="dispatch-column-header">
        <div>
          <h2>{{ status.label }}</h2>
          <span>Despachos</span>
        </div>

        <span class="dispatch-count">
          {{ tripsByStatus[status.value].length }}
        </span>
      </div>

      <div class="dispatch-column-content">
        <div
            v-for="trip in tripsByStatus[status.value]"
            :key="trip.id"
            class="dispatch-card"
        >
          <div class="dispatch-card-top">
            <strong>Viaje #{{ trip.id }}</strong>

            <span class="dispatch-status">
              {{ trip.status }}
            </span>
          </div>

          <div class="dispatch-card-info">
            <span>
              Orden: {{ trip.transportOrderId }}
            </span>

            <span v-if="trip.ambulanceId">
              Ambulancia: {{ trip.ambulanceId }}
            </span>

            <span v-if="trip.eta !== null">
              ETA: {{ trip.eta }} min
            </span>
          </div>
        </div>

        <div
            v-if="tripsByStatus[status.value].length === 0"
            class="empty-column"
        >
          Sin despachos
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dispatch-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.dispatch-column {
  min-width: 0;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
}

.dispatch-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dispatch-column-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.dispatch-column-header span {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.dispatch-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: var(--primary-color-text);
  font-size: 0.75rem;
  font-weight: 700;
}

.dispatch-column-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 120px;
}

.dispatch-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.9rem;
}

.dispatch-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.dispatch-card-top strong {
  font-size: 0.875rem;
}

.dispatch-status {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: var(--surface-100);
}

.dispatch-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

@media (max-width: 1100px) {
  .dispatch-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .dispatch-board {
    grid-template-columns: 1fr;
  }
}
</style>