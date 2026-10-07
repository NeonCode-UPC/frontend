<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Reportes"
    title="Reportes y analítica"
    subtitle="Exportación consolidada de telemetría y traslados"
    :fluid="true"
  >
    <empty-state
      icon="pi pi-chart-bar"
      title="Módulo de reportes analíticos"
      message="Próximamente disponible para exportación en formatos PDF y Excel."
    />
  </base-screen>
</template>
