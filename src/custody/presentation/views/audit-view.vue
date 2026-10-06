<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Trazabilidad"
    title="Auditoría Inmutable"
    subtitle="Manifiestos de auditoría digital y trazabilidad criptográfica de eventos"
    bounded-context="Chain of Custody & Traceability"
    search-placeholder="Buscar manifiesto por hash, traslado o fecha..."
    action-label="Verificar Integridad"
    action-icon="pi pi-shield"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-check-square text-5xl text-purple-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Auditoría Digital Inmutable</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la verificación de firmas digitales, sellado de tiempo y registros de auditoría (*DigitalAuditManifest*).
          </p>
          <pv-tag severity="secondary" value="Carpeta de trabajo: src/custody/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
