<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Monitoreo"
    title="Telemetría en Vivo"
    subtitle="Monitoreo en tiempo real de temperatura (+2°C a +8°C), batería y sensores de peso (US10, US11)"
    bounded-context="Smart Container & Telemetry Monitoring"
    search-placeholder="Buscar telemetría por ID de contenedor..."
    action-label="Calibrar Sensores"
    action-icon="pi pi-sliders-h"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-chart-line text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Telemetría IoT en Vivo</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo para los instrumentos visuales tacométricos (*ThermalTelemetryGauge*), gráficos en tiempo real y detección de caídas de voltaje de 12V.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/telemetry/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
