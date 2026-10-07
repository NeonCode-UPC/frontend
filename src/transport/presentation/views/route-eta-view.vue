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
    breadcrumb="Transporte"
    title="Rutas en operación"
    subtitle="Recorrido operativo y tiempo estimado de llegada (ETA)"
    :fluid="true"
  >
    <template #actions>
      <pv-tag :value="`${routes.length} rutas activas`" severity="info" class="border-round-pill px-3 py-1 text-xs font-semibold" />
    </template>

    <div class="route-grid">
      <content-card
        v-for="route in routes"
        :key="route.tripId"
        class="route-card"
      >
        <template #header>
          <div class="route-card-header">
            <span class="route-trip">Viaje #{{ route.tripId }}</span>
            <h3 class="route-order">Orden de traslado #{{ route.orderId }}</h3>
          </div>
        </template>

        <template #header-actions>
          <status-badge :status="route.status" />
        </template>

        <div class="route-path">
          <div class="route-point">
            <span class="point-marker origin"></span>
            <div class="point-details">
              <span class="point-label">Origen</span>
              <strong class="point-name">{{ route.origin }}</strong>
            </div>
          </div>

          <div class="route-line-connector">
            <span class="route-line"></span>
          </div>

          <div class="route-point">
            <span class="point-marker destination"></span>
            <div class="point-details">
              <span class="point-label">Destino</span>
              <strong class="point-name">{{ route.destination }}</strong>
            </div>
          </div>
        </div>

        <div class="route-footer">
          <div class="ambulance-info">
            <span class="footer-label">Ambulancia</span>
            <strong class="footer-value font-mono">{{ route.ambulance }}</strong>
          </div>

          <div class="eta-info">
            <span class="footer-label">ETA</span>
            <strong class="eta-value">{{ route.eta }} min</strong>
          </div>
        </div>
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped>
.route-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.route-card {
  border: 1px solid var(--border-subtle, #E8E6DF);
}

.route-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.route-trip {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted, #8C9E99);
  letter-spacing: 0.02em;
}

.route-order {
  margin: 0;
  color: var(--text-main, #10312F);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
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
  margin-top: 0.35rem;
  border-radius: 50%;
}

.point-marker.origin {
  background: var(--color-brand-teal, #0F7A70);
  box-shadow: 0 0 0 3px rgba(15, 122, 112, 0.15);
}

.point-marker.destination {
  background: var(--color-alert-red, #E05A46);
  box-shadow: 0 0 0 3px rgba(224, 90, 70, 0.15);
}

.point-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.point-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #5A706A);
  font-weight: 500;
}

.point-name {
  font-size: 0.875rem;
  color: var(--text-main, #10312F);
  font-weight: 600;
}

.route-line-connector {
  padding-left: 4px;
  margin: 2px 0;
}

.route-line {
  display: block;
  width: 2px;
  height: 24px;
  background: var(--border-subtle, #E8E6DF);
  border-radius: 1px;
}

.route-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-subtle, #E8E6DF);
}

.ambulance-info,
.eta-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.footer-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #5A706A);
  font-weight: 500;
}

.footer-value {
  font-size: 0.875rem;
  color: var(--text-main, #10312F);
  font-weight: 600;
}

.eta-info {
  align-items: flex-end;
}

.eta-value {
  color: var(--color-brand-teal, #0F7A70);
  font-size: 1.125rem;
  font-weight: 700;
}

@media (max-width: 900px) {
  .route-grid {
    grid-template-columns: 1fr;
  }
}
</style>
