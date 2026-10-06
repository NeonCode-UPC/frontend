<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Reportes"
    title="Reportes y Estadísticas"
    subtitle="Consolidado de traslados, auditorías de temperatura e indicadores de cumplimiento asistencial"
    bounded-context="Shared Kernel & Analytics"
    search-placeholder="Buscar reporte por rango de fechas o tipo..."
    action-label="Exportar Informe"
    action-icon="pi pi-file-excel"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-chart-bar text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Reportes & Analítica</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la visualización de métricas de desempeño logístico, horas de isquemia fría acumuladas e historial de alertas emitidas.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/shared/presentation/views/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
