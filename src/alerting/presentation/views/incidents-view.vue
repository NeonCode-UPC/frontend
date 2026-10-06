<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Alertas"
    title="Incidentes Operativos"
    subtitle="Bitácora de contingencias registradas y protocolos de mitigación ejecutados"
    bounded-context="Critical Alerting & Incident Response"
    search-placeholder="Buscar incidente por código o SmartBox..."
    action-label="Nuevo Incidente"
    action-icon="pi pi-plus"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-history text-5xl text-orange-500 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Historial de Incidentes</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la gestión de resoluciones de contingencias clínicas y trazabilidad de acciones correctivas en ruta.
          </p>
          <pv-tag severity="warn" value="Carpeta de trabajo: src/alerting/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
