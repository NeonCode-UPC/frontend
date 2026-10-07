<script setup>
import AppHeader from './app-header.vue';
import AppSidebar from './app-sidebar.vue';
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog />

  <div class="layout-wrapper flex flex-column min-h-screen">
    <!-- Top Persistent Header -->
    <app-header />

    <!-- Main Workspace with Sidebar and Screen View -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Persistent Sidebar -->
      <app-sidebar class="hidden md:flex" />

      <!-- Dynamic Screen Content Area -->
      <main class="flex-1 overflow-y-auto screen-content-bg p-3 md:p-5">
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
}

.screen-content-bg {
  background-color: #F6F5EF;
  min-height: calc(100vh - 54px);
}
</style>
