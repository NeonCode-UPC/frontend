<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Administración"
    title="Usuarios y Roles"
    subtitle="Control de identidades, perfiles médicos (CMP) y accesos de flota asistencial (US02, US03)"
    bounded-context="Identity, Access & Subscriptions (IAM)"
    search-placeholder="Buscar usuario por nombre, correo o rol..."
    action-label="Nuevo Usuario"
    action-icon="pi pi-user-plus"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-users text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Gestión de Usuarios & Roles</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo asignado al Bounded Context de <strong>Identity, Access & Subscriptions (IAM)</strong>.
            Aquí se implementarán la asignación de roles (AmbulanceOperator, HospitalPhysician, DispatchCoordinator) y control RBAC.
          </p>
          <pv-tag severity="info" value="Carpeta de trabajo: src/iam/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
