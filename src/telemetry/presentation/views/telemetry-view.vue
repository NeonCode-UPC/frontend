<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Flota"
    title="Contenedores SmartBox"
    subtitle="Inventario y estado operativo de cajas isotérmicas IoT (US08)"
    bounded-context="Smart Container & Telemetry Monitoring"
    search-placeholder="Buscar SmartBox por N° de serie o MAC..."
    action-label="Vincular SmartBox"
    action-icon="pi pi-plus"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-box text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Inventario de SmartBoxes</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo asignado al Bounded Context de <strong>Smart Container & Telemetry Monitoring</strong>.
            Aquí se implementarán la vinculación 1:1 con ambulancias (US08), verificación de UUID/MAC y estado de batería.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/telemetry/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
