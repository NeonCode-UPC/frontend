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

      <content-card padding="p-0" class="overflow-hidden">
        <div v-if="store.loading" class="p-5 text-center text-muted text-sm">
          <i class="pi pi-spin pi-spinner mr-2"></i>Cargando registros…
        </div>
        <empty-state
          v-else-if="!events.length"
          icon="pi pi-search"
          title="No hay eventos que coincidan con la búsqueda"
          message="Intenta con otro término o filtro de búsqueda."
        />
        <div v-else class="table-scroll">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Evento</th>
                <th>Recurso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td data-label="Fecha">{{ event.date.slice(0, 5) }} {{ event.time }}</td>
                <td data-label="Usuario">{{ event.user }}</td>
                <td data-label="Evento">{{ event.event }}</td>
                <td data-label="Recurso"><strong>{{ event.resource }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/audit-view.css"></style>
