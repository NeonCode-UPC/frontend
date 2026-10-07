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
  <base-screen
    breadcrumb="Custodia"
    title="Cadena de custodia"
    subtitle="Estado del sellado y trazabilidad digital por traslado"
    search-placeholder="Filtrar por código de custodia..."
    :fluid="true"
  >
    <div class="custody-page">
      <p v-if="store.error" class="inline-notice">
        <i class="pi pi-info-circle"></i>{{ store.error }}
        <button type="button" @click="store.load()">Reintentar</button>
      </p>

      <content-card padding="p-0" class="overflow-hidden">
        <div v-if="store.loading" class="p-5 text-center text-muted text-sm">
          <i class="pi pi-spin pi-spinner mr-2"></i>Cargando traslados…
        </div>
        <empty-state
          v-else-if="!filteredTransfers.length"
          icon="pi pi-search"
          title="No hay traslados que coincidan con la búsqueda"
          message="Intenta con otro código de seguimiento o filtro."
        />
        <div v-else class="table-scroll">
          <table class="custody-table">
            <thead>
              <tr>
                <th>Traslado</th>
                <th>Salida</th>
                <th>Recepción</th>
                <th>Responsable</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transfer in filteredTransfers"
                :key="transfer.id"
                :class="{ selected: selectedId === transfer.id }"
                tabindex="0"
                @click="openTransfer(transfer.id)"
                @keydown.enter="openTransfer(transfer.id)"
              >
                <td data-label="Traslado"><strong>{{ transfer.id }}</strong></td>
                <td data-label="Salida">{{ transfer.departureAt.split('·')[1]?.trim() }}</td>
                <td data-label="Recepción">{{ receivedTime(transfer) }}</td>
                <td data-label="Responsable">{{ transfer.recipient || '—' }}</td>
                <td data-label="Estado">
                  <status-badge :status="transfer.status" :label="statusLabel(transfer.status)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </content-card>

      <content-card
        v-if="route.query.transfer && selectedTransfer"
        class="timeline-panel"
        padding="p-4"
      >
        <template #header>
          <div>
            <h2 class="text-base md:text-lg font-bold text-main m-0">
              {{ selectedTransfer.id }} · {{ selectedTransfer.route }}
            </h2>
            <p class="text-xs text-muted m-0 mt-1">
              {{ selectedTransfer.cargo }} · {{ selectedTransfer.smartBox }}
            </p>
          </div>
        </template>
        <template #header-actions>
          <status-badge :status="selectedTransfer.status" :label="statusLabel(selectedTransfer.status)" />
        </template>

        <ol class="timeline">
          <li
            v-for="event in selectedTransfer.events"
            :key="`${event.date}-${event.time}`"
            :class="event.type"
          >
            <span class="timeline-dot"></span>
            <div>
              <strong>{{ event.title }}</strong>
              <p>{{ event.detail }}</p>
              <small>{{ event.date }} · {{ event.time }}</small>
            </div>
          </li>
        </ol>
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/custody-view.css"></style>
