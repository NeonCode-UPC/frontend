<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Flota"
    title="Ambulancias"
    subtitle="Registro y control de flota de unidades de emergencia (US07)"
    bounded-context="Medical Transport Planning & Dispatching"
    search-placeholder="Buscar ambulancia por placa, modelo o conductor..."
    action-label="Registrar Ambulancia"
    action-icon="pi pi-plus"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-car text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Gestión de Ambulancias</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la implementación del CRUD de vehículos de emergencia (US07: Alta de Unidades de Ambulancia), asignación de choferes y paramédicos.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/transport/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
