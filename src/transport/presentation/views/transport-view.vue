<script setup>
import { computed, onMounted } from 'vue';
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
import DispatchBoard from '../components/dispatch-board.vue';
import { useTransportStore } from '../../application/transport.store.js';

const transportStore = useTransportStore();

onMounted(() => {
  transportStore.fetchDispatchTrips();
});

const defaultTrips = [
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
];

const trips = computed(() => {
  return transportStore.dispatchTrips.length > 0
    ? transportStore.dispatchTrips
    : defaultTrips;
});
</script>

<template>
  <base-screen
    breadcrumb="Transporte"
    title="Despacho de vehículos"
    subtitle="Gestión de traslados y asignación de ambulancias en tiempo real"
    :fluid="true"
  >
    <dispatch-board :dispatch-trips="trips" />
  </base-screen>
</template>