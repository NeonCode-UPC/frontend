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
      title="Ambulancias"
      bounded-context="Medical Transport Planning & Dispatching"
      search-placeholder="Filtrar por placa o conductor..."
  >
    <div class="ambulances-content">
      <div class="ambulances-header">
        <div>
          <h1>Flota de ambulancias</h1>
          <p>
            Consulta la disponibilidad y estado operativo de los vehículos.
          </p>
        </div>

        <div class="ambulances-summary">
          <span>{{ ambulances.length }}</span>
          <small>ambulancias</small>
        </div>
      </div>

      <div class="ambulances-grid">
        <article
            v-for="ambulance in ambulances"
            :key="ambulance.id"
            class="ambulance-card"
        >
          <div class="ambulance-card-header">
            <div>
              <span class="ambulance-id">
                {{ ambulance.id }}
              </span>

              <h2>{{ ambulance.plate }}</h2>
            </div>

            <span
                class="ambulance-status"
                :class="{
                available: ambulance.status === 'Disponible',
                transit: ambulance.status === 'En ruta',
                maintenance: ambulance.status === 'Mantenimiento'
              }"
            >
              {{ ambulance.status }}
            </span>
          </div>

          <div class="ambulance-driver">
            <span>Conductor</span>
            <strong>{{ ambulance.driver }}</strong>
          </div>
        </article>
      </div>
    </div>
  </base-screen>
</template>

<style scoped>
.ambulances-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ambulances-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ambulances-header h1 {
  margin: 0;
  color: #10312f;
  font-size: 1.25rem;
  font-weight: 700;
}

.ambulances-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.ambulances-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: #f4f7f6;
  border: 1px solid #e2e8f0;
}

.ambulances-summary span {
  color: #0f7a70;
  font-size: 1.25rem;
  font-weight: 700;
}

.ambulances-summary small {
  color: #64748b;
  font-size: 0.7rem;
}

.ambulances-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.ambulance-card {
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.ambulance-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.ambulance-id {
  display: block;
  margin-bottom: 0.25rem;
  color: #64748b;
  font-size: 0.7rem;
}

.ambulance-card h2 {
  margin: 0;
  color: #10312f;
  font-size: 1rem;
  font-weight: 700;
}

.ambulance-status {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.ambulance-status.available {
  background: #b9dda0;
  color: #10312f;
}

.ambulance-status.transit {
  background: #dbeafe;
  color: #1e40af;
}

.ambulance-status.maintenance {
  background: #fee2e2;
  color: #991b1b;
}

.ambulance-driver {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.ambulance-driver span {
  color: #64748b;
  font-size: 0.7rem;
}

.ambulance-driver strong {
  color: #10312f;
  font-size: 0.8rem;
}

@media (max-width: 1000px) {
  .ambulances-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .ambulances-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .ambulances-grid {
    grid-template-columns: 1fr;
  }
}
</style>