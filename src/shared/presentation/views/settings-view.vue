<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Cuenta"
    title="Ajustes de la Plataforma"
    subtitle="Configuración de notificaciones sonoras, unidades de temperatura e idioma del sistema"
    bounded-context="Shared Kernel & User Preferences"
    search-placeholder="Buscar parámetro de configuración..."
    action-label="Guardar Preferencias"
    action-icon="pi pi-check"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-cog text-5xl text-gray-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Preferencias de Usuario</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la gestión de preferencias personales del operador, alertas en cabina y configuración de interfaz.
          </p>
          <pv-tag severity="secondary" value="Carpeta de trabajo: src/shared/presentation/views/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
