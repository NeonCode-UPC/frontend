<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Operaciones"
    title="Ruta y ETA"
    subtitle="Monitoreo de tráfico, tiempo estimado de llegada y cálculo de isquemia fría"
    bounded-context="Medical Transport Planning & Dispatching"
    search-placeholder="Buscar ruta, origen o hospital de destino..."
    action-label="Optimizar Ruta"
    action-icon="pi pi-compass"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-map-marker text-5xl text-blue-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Monitoreo de Rutas & ETA</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para integrar el mapa de geolocalización, geocercas hospitalarias de 2 km y alertas de preaviso de 10 minutos.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/transport/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
