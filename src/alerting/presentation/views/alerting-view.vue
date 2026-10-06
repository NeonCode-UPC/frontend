<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Alertas"
    title="Alertas Críticas"
    subtitle="Supervisión reactiva ante excursiones térmicas y aperturas indebidas (US14)"
    bounded-context="Critical Alerting & Incident Response"
    search-placeholder="Filtrar alertas por código, severidad o unidad..."
    action-label="Configurar Umbrales"
    action-icon="pi pi-cog"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Centro de Alertas Críticas</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo asignado al Bounded Context de <strong>Critical Alerting & Incident Response</strong>.
            Aquí se implementarán la notificación de desvíos térmicos (+2.0 °C / +8.0 °C), preaviso hospitalario y escalamiento de emergencias.
          </p>
          <pv-tag severity="danger" value="Carpeta de trabajo: src/alerting/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
