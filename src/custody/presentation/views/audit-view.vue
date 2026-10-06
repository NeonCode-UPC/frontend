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
  <section class="audit-page">
    <header class="screen-title"><div><span class="breadcrumb">Auditoría</span><h1>Auditoría</h1><p>Registro de eventos de la institución</p></div><button class="export-action" type="button" @click="exportRecords"><i class="pi pi-download"></i> Exportar</button></header>
    <section class="table-panel" aria-label="Registro de eventos de auditoría">
      <div v-if="store.loading" class="empty-state">Cargando registros…</div>
      <div v-else-if="!events.length" class="empty-state">No hay eventos que coincidan con la búsqueda.</div>
      <div v-else class="table-scroll"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Evento</th><th>Recurso</th></tr></thead><tbody><tr v-for="event in events" :key="event.id"><td data-label="Fecha">{{ event.date.slice(0, 5) }} {{ event.time }}</td><td data-label="Usuario">{{ event.user }}</td><td data-label="Evento">{{ event.event }}</td><td data-label="Recurso">{{ event.resource }}</td></tr></tbody></table></div>
    </section>
  </section>
</template>

<style scoped src="../styles/audit-view.css"></style>
