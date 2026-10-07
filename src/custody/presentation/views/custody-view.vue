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
        <app-data-table
          :value="filteredTransfers"
          :loading="store.loading"
          min-width="45rem"
          empty-title="No hay traslados que coincidan con la búsqueda"
          empty-message="Intenta con otro código de seguimiento o filtro."
          @row-click="event => openTransfer(event.data.id)"
        >
          <pv-column field="id" header="TRASLADO" sortable>
            <template #body="{ data }">
              <strong class="text-main cursor-pointer">{{ data.id }}</strong>
            </template>
          </pv-column>

          <pv-column field="departureAt" header="SALIDA">
            <template #body="{ data }">
              <span class="text-secondary text-sm">{{ data.departureAt?.split('·')[1]?.trim() }}</span>
            </template>
          </pv-column>

          <pv-column field="receivedAt" header="RECEPCIÓN">
            <template #body="{ data }">
              <span class="text-secondary text-sm">{{ receivedTime(data) }}</span>
            </template>
          </pv-column>

          <pv-column field="recipient" header="RESPONSABLE">
            <template #body="{ data }">
              <span class="text-secondary text-sm">{{ data.recipient || '—' }}</span>
            </template>
          </pv-column>

          <pv-column field="status" header="ESTADO" sortable>
            <template #body="{ data }">
              <status-badge :status="data.status" :label="statusLabel(data.status)" />
            </template>
          </pv-column>
        </app-data-table>
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

        <app-timeline
          :steps="(selectedTransfer.events || []).map(ev => ({
            name: ev.title,
            detail: ev.detail,
            time: `${ev.date} · ${ev.time}`,
            type: ev.type === 'warning' ? 'alert' : ev.type === 'success' ? 'success' : 'checkpoint'
          }))"
        />
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/custody-view.css"></style>
