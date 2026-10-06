<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Administración"
    title="Suscripción SaaS"
    subtitle="Gestión del plan institucional, límites de ambulancias y capacidad de cajas isotérmicas"
    bounded-context="Identity, Access & Subscriptions (IAM)"
    search-placeholder="Buscar detalles del plan SaaS..."
    action-label="Actualizar Plan"
    action-icon="pi pi-credit-card"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-credit-card text-5xl text-blue-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Planes de Suscripción</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio para la administración de licencias B2B para clínicas, hospitales y flotas privadas de ambulancias.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/iam/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
