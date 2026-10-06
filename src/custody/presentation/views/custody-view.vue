<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Trazabilidad"
    title="Cadena de Custodia"
    subtitle="Protocolo de entrega hospitalaria con validación de código OTP y apertura de cerrojo (US17)"
    bounded-context="Chain of Custody & Traceability"
    search-placeholder="Buscar traslado, hospital o médico receptor..."
    action-label="Ingresar Código OTP"
    action-icon="pi pi-key"
  >
    <template #default="{ searchQuery }">
      <div class="surface-card border-round-xl p-4 shadow-1">
        <div class="text-center py-6">
          <i class="pi pi-lock text-5xl text-teal-600 mb-3"></i>
          <h2 class="text-xl font-bold text-900 mb-2">Vista Base: Cadena de Custodia & Protocolo OTP</h2>
          <p class="text-secondary text-sm max-w-2xl mx-auto mb-4">
            Espacio de trabajo asignado al Bounded Context de <strong>Chain of Custody & Traceability</strong>.
            Aquí se implementarán la validación criptográfica de tokens OTP de 6 dígitos (*OtpHandoverDialog*) para apertura de tapas en quirófano.
          </p>
          <pv-tag severity="success" value="Carpeta de trabajo: src/custody/" />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
