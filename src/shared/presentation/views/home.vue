<script setup>
import BaseScreen from '../components/base-screen.vue';
</script>

<template>
  <base-screen
    title="Panel"
    bounded-context="Centro de Operaciones Medical SMARTBOX"
    search-placeholder="Filtrar por ruta, estado o SmartBox..."
  >
    <template #default="{ searchQuery }">
      <!-- 4 Top KPI Cards from design -->
      <div class="grid">
        <div class="col-12 sm:col-6 lg:col-3">
          <div class="screen-card border-round-xl p-3">
            <span class="text-2xl font-bold text-main block">18</span>
            <span class="text-xs text-muted block mt-1">Transportes activos</span>
          </div>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <div class="screen-card border-round-xl p-3" style="border-top: 3px solid #0F7A70;">
            <span class="text-2xl font-bold text-main block">11 / 12</span>
            <span class="text-xs text-muted block mt-1">SmartBox en línea</span>
          </div>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <div class="screen-card border-round-xl p-3" style="border-top: 3px solid #E05A46;">
            <span class="text-2xl font-bold text-main block">2</span>
            <span class="text-xs text-muted block mt-1">Alertas activas</span>
          </div>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <div class="screen-card border-round-xl p-3">
            <span class="text-2xl font-bold text-main block">14:35</span>
            <span class="text-xs text-muted block mt-1">Próxima llegada</span>
          </div>
        </div>
      </div>
    </template>
  </base-screen>
</template>

<style scoped>
</style>
