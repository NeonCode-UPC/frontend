<script setup>
import {ref} from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
import DispatchBoard from '../components/dispatch-board.vue';

const dispatchTrips = ref([
  {
    id: 1001,
    transportOrderId: 501,
    ambulanceId: 'AMB-001',
    status: 'Pending',
    eta: null
  },
  {
    id: 1002,
    transportOrderId: 502,
    ambulanceId: 'AMB-003',
    status: 'Pending',
    eta: null
  },
  {
    id: 1003,
    transportOrderId: 503,
    ambulanceId: 'AMB-002',
    status: 'Assigned',
    eta: 25
  },
  {
    id: 1004,
    transportOrderId: 504,
    ambulanceId: 'AMB-005',
    status: 'Assigned',
    eta: 18
  },
  {
    id: 1005,
    transportOrderId: 505,
    ambulanceId: 'AMB-004',
    status: 'InTransit',
    eta: 12
  },
  {
    id: 1006,
    transportOrderId: 506,
    ambulanceId: 'AMB-006',
    status: 'InTransit',
    eta: 7
  },
  {
    id: 1007,
    transportOrderId: 507,
    ambulanceId: 'AMB-007',
    status: 'Completed',
    eta: 0
  }
]);
</script>

<template>
  <base-screen
      title="Traslados"
      bounded-context="Medical Transport Planning & Dispatching"
      search-placeholder="Filtrar por orden, estado o destino..."
  >
    <div class="transport-content">
      <div class="transport-header">
        <div>
          <h1>Despacho de vehículos</h1>
          <p>
            Gestiona los traslados y el estado operativo de las ambulancias.
          </p>
        </div>
      </div>

      <dispatch-board :dispatch-trips="dispatchTrips" />
    </div>
  </base-screen>
</template>

<style scoped>
.transport-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.transport-header h1 {
  margin: 0;
  color: #10312f;
  font-size: 1.25rem;
  font-weight: 700;
}

.transport-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.875rem;
}
</style>