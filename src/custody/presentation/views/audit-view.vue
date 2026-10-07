<script setup>
import { computed, onMounted } from 'vue';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useCustodyStore } from '../../application/custody-store.js';

const store = useCustodyStore();
const { searchQuery, configureHeader } = useLayoutHeader();
onMounted(() => { configureHeader({ placeholder: 'Filtrar por registro de auditoría...', visible: true }); store.load(); });
const events = computed(() => store.auditEvents.filter((event) => !searchQuery.value || `${event.date} ${event.time} ${event.user} ${event.event} ${event.resource}`.toLocaleLowerCase('es').includes(searchQuery.value.toLocaleLowerCase('es'))));
const exportRecords = () => window.print();
</script>

<template>
  <base-screen
    breadcrumb="Auditoría"
    title="Auditoría institucional"
    subtitle="Registro inmutable de eventos y accesos en el sistema"
    search-placeholder="Filtrar por registro de auditoría..."
    :fluid="true"
  >
    <template #actions>
      <pv-button
        label="Exportar"
        icon="pi pi-download"
        severity="secondary"
        outlined
        class="border-round-pill"
        @click="exportRecords"
      />
    </template>

    <div class="audit-page">
      <p v-if="store.error" class="inline-notice">
        <i class="pi pi-info-circle"></i>{{ store.error }}
        <button type="button" @click="store.load()">Reintentar</button>
      </p>

      <app-data-table
        :value="events"
        :loading="store.loading"
        min-width="45rem"
        empty-title="No hay eventos que coincidan con la búsqueda"
        empty-message="Intenta con otro término o filtro de búsqueda."
      >
        <pv-column field="date" header="FECHA">
          <template #body="{ data }">
            <span class="text-secondary text-sm">{{ data.date.slice(0, 5) }} {{ data.time }}</span>
          </template>
        </pv-column>

        <pv-column field="user" header="USUARIO">
          <template #body="{ data }">
            <span class="text-main font-medium text-sm">{{ data.user }}</span>
          </template>
        </pv-column>

        <pv-column field="event" header="EVENTO">
          <template #body="{ data }">
            <span class="text-secondary text-sm">{{ data.event }}</span>
          </template>
        </pv-column>

        <pv-column field="resource" header="RECURSO">
          <template #body="{ data }">
            <strong class="text-main text-sm font-semibold">{{ data.resource }}</strong>
          </template>
        </pv-column>
      </app-data-table>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/audit-view.css"></style>
