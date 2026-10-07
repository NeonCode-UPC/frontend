<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Configuración"
    title="Ajustes del sistema"
    subtitle="Canales de notificación y parámetros del dispositivo"
    :fluid="true"
  >
    <empty-state
      icon="pi pi-cog"
      title="Parámetros operativos"
      message="Configuración de umbrales térmicos y canales de alerta Push/SMS."
    />
  </base-screen>
</template>
