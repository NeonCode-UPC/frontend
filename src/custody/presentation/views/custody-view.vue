<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useCustodyStore } from '../../application/custody-store.js';

const store = useCustodyStore();
const route = useRoute();
const router = useRouter();
const { searchQuery, configureHeader } = useLayoutHeader();
const selectedId = computed(() => route.query.transfer || '');

onMounted(() => {
  configureHeader({ placeholder: 'Filtrar por código de custodia...', visible: true });
  store.load();
});

const filteredTransfers = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es');
  return store.transfers.filter((item) => !query || [item.id, item.route, item.recipient, item.cargo].some((value) => value?.toLocaleLowerCase('es').includes(query)));
});
const selectedTransfer = computed(() => store.findTransfer(selectedId.value));
const openTransfer = (id) => router.push({ path: '/custody', query: { transfer: id } });
const statusLabel = (status) => ({ closed: 'Cerrada', 'in-transit': 'En tránsito', exception: 'Cerrada con excursión' }[status] || status);
const receivedTime = (transfer) => transfer.receivedAt?.split('·')[1]?.trim() || '—';
</script>

<template>
  <section class="custody-page">
    <header class="screen-title"><span class="breadcrumb">Cadena de custodia</span><h1>Cadena de custodia</h1><p>Estado del sellado por traslado</p></header>
    <label class="mobile-search"><i class="pi pi-search"></i><input v-model="searchQuery" type="search" placeholder="Filtrar por código de custodia" /></label>
    <p v-if="store.error" class="inline-notice"><i class="pi pi-info-circle"></i>{{ store.error }} <button type="button" @click="store.load()">Reintentar</button></p>

    <section class="table-panel" aria-label="Traslados y estado de custodia">
      <div v-if="store.loading" class="empty-state">Cargando traslados…</div>
      <div v-else-if="!filteredTransfers.length" class="empty-state">No hay traslados que coincidan con la búsqueda.</div>
      <div v-else class="table-scroll"><table class="custody-table"><thead><tr><th>Traslado</th><th>Salida</th><th>Recepción</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>
        <tr v-for="transfer in filteredTransfers" :key="transfer.id" :class="{ selected: selectedId === transfer.id }" tabindex="0" @click="openTransfer(transfer.id)" @keydown.enter="openTransfer(transfer.id)">
          <td data-label="Traslado"><strong>{{ transfer.id }}</strong></td>
          <td data-label="Salida">{{ transfer.departureAt.split('·')[1]?.trim() }}</td>
          <td data-label="Recepción">{{ receivedTime(transfer) }}</td>
          <td data-label="Responsable">{{ transfer.recipient || '—' }}</td>
          <td data-label="Estado"><span class="status-badge" :class="transfer.status">{{ statusLabel(transfer.status) }}</span></td>
        </tr>
      </tbody></table></div>
    </section>

    <section v-if="route.query.transfer && selectedTransfer" class="timeline-panel">
      <header class="timeline-heading"><div><h2>{{ selectedTransfer.id }} · {{ selectedTransfer.route }}</h2><p>{{ selectedTransfer.cargo }} · {{ selectedTransfer.smartBox }}</p></div><span class="status-badge" :class="selectedTransfer.status">{{ statusLabel(selectedTransfer.status) }}</span></header>
      <ol class="timeline"><li v-for="event in selectedTransfer.events" :key="`${event.date}-${event.time}`" :class="event.type"><span class="timeline-dot"></span><div><strong>{{ event.title }}</strong><p>{{ event.detail }}</p><small>{{ event.date }} · {{ event.time }}</small></div></li></ol>
    </section>
  </section>
</template>

<style scoped src="../styles/custody-view.css"></style>
