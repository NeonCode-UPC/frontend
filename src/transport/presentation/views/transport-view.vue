<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Operaciones"
    title="Traslados Médicos"
    subtitle="Gestión de solicitudes y seguimiento de traslados clínicos en curso"
    bounded-context="Medical Transport Planning & Dispatching"
    search-placeholder="Filtrar traslados por orden, paciente u hospital..."
    action-label="Nuevo traslado"
    action-icon="pi pi-plus"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-send text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Traslados Clínicos</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo asignado al Bounded Context de <strong>Transport Planning & Dispatching</strong>.
            Aquí se implementarán la lista de órdenes de transporte, filtros de estado y asignación de unidades.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/transport/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
