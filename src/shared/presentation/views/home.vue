<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    breadcrumb="Operaciones"
    title="Dashboard general"
    subtitle="Centro de Operaciones Medical SMARTBOX · Lima Metropolitana"
    :fluid="true"
  >
    <template #default="{ searchQuery }">
      <!-- 4 Top KPI Cards from design -->
      <div class="grid">
        <div class="col-12 sm:col-6 lg:col-3">
          <kpi-card
            value="18"
            label="Transportes activos"
            icon="pi pi-truck"
          />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <kpi-card
            value="11 / 12"
            label="SmartBox en línea"
            accent="teal"
            icon="pi pi-box"
          />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <kpi-card
            value="2"
            label="Alertas activas"
            accent="red"
            icon="pi pi-bell"
          />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <kpi-card
            value="14:35"
            label="Próxima llegada"
            icon="pi pi-clock"
          />
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
