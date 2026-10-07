<script setup>
import {ref} from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';

const ambulances = ref([
  {
    id: 'AMB-001',
    plate: 'A7K-421',
    driver: 'Carlos Mendoza',
    status: 'Disponible'
  },
  {
    id: 'AMB-002',
    plate: 'B3P-582',
    driver: 'Luis Ramírez',
    status: 'En ruta'
  },
  {
    id: 'AMB-003',
    plate: 'C9M-714',
    driver: 'Jorge Salazar',
    status: 'Disponible'
  },
  {
    id: 'AMB-004',
    plate: 'D5R-306',
    driver: 'Miguel Torres',
    status: 'En ruta'
  },
  {
    id: 'AMB-005',
    plate: 'E2T-918',
    driver: 'Andrés Flores',
    status: 'Mantenimiento'
  },
  {
    id: 'AMB-006',
    plate: 'F8L-245',
    driver: 'Pedro Castillo',
    status: 'Disponible'
  }
]);
</script>

<template>
  <base-screen
    breadcrumb="Transporte"
    title="Flota de ambulancias"
    subtitle="Disponibilidad y estado operativo de vehículos en tiempo real"
    :fluid="true"
  >
    <template #actions>
      <pv-tag :value="`${ambulances.length} vehículos`" severity="info" class="border-round-pill px-3 py-1 text-xs font-semibold" />
    </template>

    <div class="ambulances-grid">
      <content-card
        v-for="ambulance in ambulances"
        :key="ambulance.id"
        interactive
        class="ambulance-card"
      >
        <template #header>
          <div class="ambulance-card-header">
            <span class="ambulance-id">{{ ambulance.id }}</span>
            <h3 class="ambulance-plate">{{ ambulance.plate }}</h3>
          </div>
        </template>

        <template #header-actions>
          <status-badge :status="ambulance.status" />
        </template>

        <div class="ambulance-driver">
          <span class="driver-label">Conductor</span>
          <strong class="driver-name">{{ ambulance.driver }}</strong>
        </div>
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped>
.ambulances-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.ambulance-card {
  border: 1px solid var(--border-subtle, #E8E6DF);
}

.ambulance-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ambulance-id {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted, #8C9E99);
  letter-spacing: 0.02em;
}

.ambulance-plate {
  margin: 0;
  color: var(--text-main, #10312F);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.ambulance-driver {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.85rem;
  margin-top: 0.25rem;
  border-top: 1px solid var(--border-subtle, #E8E6DF);
}

.driver-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #5A706A);
  font-weight: 500;
}

.driver-name {
  font-size: 0.875rem;
  color: var(--text-main, #10312F);
  font-weight: 600;
}

@media (max-width: 992px) {
  .ambulances-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ambulances-grid {
    grid-template-columns: 1fr;
  }
}
</style>