<script setup>
import {ref} from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';

const routes = ref([
  {
    tripId: 1003,
    orderId: 502,
    ambulance: 'AMB-003',
    origin: 'Clínica San Borja',
    destination: 'Hospital Nacional Dos de Mayo',
    eta: 25,
    status: 'Asignado'
  },
  {
    tripId: 1004,
    orderId: 503,
    ambulance: 'AMB-002',
    origin: 'Hospital Rebagliati',
    destination: 'Instituto Nacional de Salud del Niño',
    eta: 18,
    status: 'Asignado'
  },
  {
    tripId: 1005,
    orderId: 504,
    ambulance: 'AMB-004',
    origin: 'Clínica Internacional',
    destination: 'Hospital Guillermo Almenara',
    eta: 12,
    status: 'En tránsito'
  },
  {
    tripId: 1006,
    orderId: 505,
    ambulance: 'AMB-006',
    origin: 'Hospital Cayetano Heredia',
    destination: 'Hospital María Auxiliadora',
    eta: 7,
    status: 'En tránsito'
  }
]);
</script>

<template>
  <base-screen
      title="Ruta y ETA"
      bounded-context="Medical Transport Planning & Dispatching"
      search-placeholder="Filtrar por ruta o tiempo estimado..."
  >
    <div class="route-content">
      <div class="route-header">
        <div>
          <h1>Rutas en operación</h1>
          <p>
            Consulta el recorrido operativo y el tiempo estimado de llegada
            de los traslados activos.
          </p>
        </div>
      </div>

      <div class="route-list">
        <article
            v-for="route in routes"
            :key="route.tripId"
            class="route-card"
        >
          <div class="route-card-header">
            <div>
              <span class="route-trip">
                Viaje #{{ route.tripId }}
              </span>

              <h2>
                Orden de traslado #{{ route.orderId }}
              </h2>
            </div>

            <span
                class="route-status"
                :class="{
                assigned: route.status === 'Asignado',
                transit: route.status === 'En tránsito'
              }"
            >
              {{ route.status }}
            </span>
          </div>

          <div class="route-path">
            <div class="route-point">
              <span class="point-marker origin"></span>

              <div>
                <small>Origen</small>
                <strong>{{ route.origin }}</strong>
              </div>
            </div>

            <div class="route-line"></div>

            <div class="route-point">
              <span class="point-marker destination"></span>

              <div>
                <small>Destino</small>
                <strong>{{ route.destination }}</strong>
              </div>
            </div>
          </div>

          <div class="route-footer">
            <div class="ambulance-info">
              <span>Ambulancia</span>
              <strong>{{ route.ambulance }}</strong>
            </div>

            <div class="eta-info">
              <span>ETA</span>
              <strong>{{ route.eta }} min</strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  </base-screen>
</template>

<style scoped>
.route-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.route-header h1 {
  margin: 0;
  color: #10312f;
  font-size: 1.25rem;
  font-weight: 700;
}

.route-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-card {
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.route-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.route-trip {
  display: block;
  margin-bottom: 0.25rem;
  color: #64748b;
  font-size: 0.7rem;
}

.route-card h2 {
  margin: 0;
  color: #10312f;
  font-size: 0.95rem;
  font-weight: 700;
}

.route-status {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.route-status.assigned {
  background: #fef3c7;
  color: #92400e;
}

.route-status.transit {
  background: #dbeafe;
  color: #1e40af;
}

.route-path {
  display: flex;
  flex-direction: column;
  margin: 1.25rem 0;
}

.route-point {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.point-marker {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  margin-top: 0.3rem;
  border-radius: 50%;
}

.point-marker.origin {
  background: #0f7a70;
}

.point-marker.destination {
  background: #e05a46;
}

.route-point div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.route-point small {
  color: #64748b;
  font-size: 0.7rem;
}

.route-point strong {
  color: #10312f;
  font-size: 0.8rem;
}

.route-line {
  width: 2px;
  height: 24px;
  margin: 2px 0 2px 4px;
  background: #e2e8f0;
}

.route-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #e2e8f0;
}

.ambulance-info,
.eta-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ambulance-info span,
.eta-info span {
  color: #64748b;
  font-size: 0.7rem;
}

.ambulance-info strong {
  color: #10312f;
  font-size: 0.8rem;
}

.eta-info {
  align-items: flex-end;
}

.eta-info strong {
  color: #0f7a70;
  font-size: 1rem;
  font-weight: 700;
}

@media (max-width: 650px) {
  .route-card-header {
    flex-direction: column;
  }

  .route-footer {
    align-items: flex-start;
  }
}
</style>
