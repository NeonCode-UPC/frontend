<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Trazabilidad"
    title="Actas Digitales"
    subtitle="Generación y firma electrónica de actas de recepción para MINSA / DIGEMID"
    bounded-context="Chain of Custody & Traceability"
    search-placeholder="Buscar acta digital por código o fecha..."
    action-label="Descargar Acta PDF"
    action-icon="pi pi-download"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-file text-5xl text-blue-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Actas Digitales Regulatorias</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la visualización y exportación de actas digitales de entrega conforme a R.M. N° 833-2015/MINSA.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/custody/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
