<script setup>
import { useLayoutHeader } from '../../composables/use-layout-header.js';
import LanguageSwitcher from './language-switcher.vue';

const { searchQuery, searchPlaceholder, searchVisible, notificationCount, currentUser } = useLayoutHeader();
</script>

<template>
  <header class="w-full bg-white border-bottom-1 surface-border px-4 py-2 sticky top-0 z-5 flex align-items-center justify-content-between gap-3 shadow-1">
    <!-- Left: Brand Logo & Title -->
    <div class="flex align-items-center gap-3">
      <router-link to="/home" class="flex align-items-center gap-2 no-underline">
        <div class="w-2rem h-2rem border-round-md bg-medical-teal flex align-items-center justify-content-center text-white">
          <i class="pi pi-box text-sm"></i>
        </div>
        <span class="font-extrabold text-lg text-900 tracking-tight">Medical SmartBox</span>
      </router-link>
    </div>

    <!-- Center-Left: Configurable Search Bar -->
    <div v-if="searchVisible" class="flex-1 max-w-28rem hidden md:block">
      <pv-icon-field class="w-full">
        <pv-input-icon class="pi pi-search text-secondary" />
        <pv-input-text
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="w-full border-round-3xl text-sm surface-50 border-1 border-200 pl-5 py-2 hover:surface-0 focus:surface-0"
        />
      </pv-icon-field>
    </div>

    <!-- Right: User Information, Notifications & Avatar -->
    <div class="flex align-items-center gap-3">
      <!-- User Text (Role and Institution) -->
      <div class="text-right hidden sm:block">
        <div class="text-xs text-secondary font-medium">
          <strong class="text-800">{{ currentUser.name }}</strong>
          <span> · {{ currentUser.role }} · </span>
          <span class="text-teal-700 font-semibold">{{ currentUser.institution }}</span>
        </div>
      </div>

      <!-- Notification Bell with Alert Dot -->
      <router-link to="/alerting" class="relative no-underline">
        <div class="w-2rem h-2rem border-round-circle surface-100 hover:surface-200 flex align-items-center justify-content-center text-700 transition-colors">
          <i class="pi pi-bell text-sm"></i>
        </div>
        <span
          v-if="notificationCount > 0"
          class="absolute top-0 right-0 w-8px h-8px bg-red-500 border-circle border-1 border-white"
        ></span>
      </router-link>

      <!-- User Avatar Circle -->
      <div class="w-2rem h-2rem border-round-circle bg-teal-100 text-teal-800 flex align-items-center justify-content-center font-bold text-xs shadow-1">
        LQ
      </div>

      <!-- Compact Language Switcher -->
      <div class="hidden lg:block border-left-1 surface-border pl-2">
        <language-switcher />
      </div>
    </div>
  </header>
</template>

<style scoped>
.w-8px {
  width: 8px;
}
.h-8px {
  height: 8px;
}
</style>
