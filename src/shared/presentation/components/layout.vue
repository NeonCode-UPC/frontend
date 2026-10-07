<script setup>
import AppHeader from './app-header.vue';
import AppSidebar from './app-sidebar.vue';
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog />

  <div class="layout-wrapper flex flex-column h-screen max-h-screen overflow-hidden">
    <!-- Top Persistent Header -->
    <app-header class="flex-shrink-0" />

    <!-- Main Workspace with Sidebar and Screen View -->
    <div class="workspace-container flex flex-1 overflow-hidden">
      <!-- Left Persistent Sidebar (Never scrolls with screen) -->
      <app-sidebar class="hidden md:flex flex-shrink-0" />

      <!-- Dynamic Screen Content Area (Only this element scrolls) -->
      <main class="workspace-main flex-1 overflow-y-auto screen-content-bg p-3 md:p-5">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  background-color: #F6F5EF;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.workspace-container {
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.workspace-main {
  background-color: #F6F5EF;
  min-height: 0;
  min-width: 0;
  height: 100%;
}

/* Scrollbar sutil y moderno para el área principal de contenido */
.workspace-main::-webkit-scrollbar {
  width: 6px;
}

.workspace-main::-webkit-scrollbar-track {
  background: transparent;
}

.workspace-main::-webkit-scrollbar-thumb {
  background-color: #D5D2C8;
  border-radius: 9999px;
}

.workspace-main::-webkit-scrollbar-thumb:hover {
  background-color: #B8B5AA;
}
</style>
