<script setup>
import { useLayoutHeader } from '../../composables/use-layout-header.js';

const { searchQuery, searchPlaceholder, searchVisible, notificationCount, currentUser } = useLayoutHeader();
</script>

<template>
  <header class="app-header flex align-items-center justify-content-between px-3 md:px-4 sticky top-0 z-5">
    <!-- Left: Logo & Brand Name -->
    <div class="flex align-items-center gap-3">
      <router-link to="/home" class="flex align-items-center gap-2 no-underline">
        <div class="logo-badge flex align-items-center justify-content-center">
          <i class="pi pi-wave-pulse text-sm text-green-300"></i>
        </div>
        <span class="brand-title">Medical SmartBox</span>
      </router-link>
    </div>

    <!-- Center: Search Input (Configurable by screen) -->
    <div v-if="searchVisible" class="search-wrapper hidden md:block">
      <div class="search-box flex align-items-center gap-2 px-3 py-1">
        <i class="pi pi-search text-xs text-muted"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-btn"
          @click="searchQuery = ''"
        >
          <i class="pi pi-times text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Right: User Info & Notification -->
    <div class="flex align-items-center gap-3">
      <!-- User Metadata -->
      <div class="user-metadata text-right hidden sm:block text-muted">
        <span class="font-bold text-main">{{ currentUser.name }}</span>
        <span> · {{ currentUser.role }} · </span>
        <span>{{ currentUser.institution }}</span>
      </div>

      <!-- Notification Bell -->
      <router-link to="/alerting" class="bell-btn flex align-items-center justify-content-center relative no-underline">
        <i class="pi pi-bell text-xs text-main"></i>
        <span
          v-if="notificationCount > 0"
          class="bell-badge absolute"
        ></span>
      </router-link>

      <!-- Avatar Circle -->
      <div class="avatar-circle flex align-items-center justify-content-center" role="img" aria-label="Perfil de usuario">
        <span>{{ currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'AS' }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--bg-app, #F6F5EF);
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
  height: 54px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  box-sizing: border-box;
}

.logo-badge {
  width: 24px;
  height: 24px;
  background-color: var(--color-brand-dark, #10312F);
  border-radius: 6px;
}

.brand-title {
  color: var(--color-brand-dark, #10312F);
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}

.search-box {
  background-color: var(--bg-card, #FFFFFF);
  border: 1px solid #E2E0D8;
  border-radius: 9999px;
  width: 320px;
  height: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 0.8125rem;
  color: var(--text-main, #10312F);
}

.search-input::placeholder {
  color: var(--text-muted, #8C9E99);
}

.user-metadata {
  font-size: 0.75rem;
  white-space: nowrap;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--text-muted, #8C9E99);
}

.bell-btn {
  width: 32px;
  height: 32px;
  background-color: var(--bg-card, #FFFFFF);
  border: 1px solid #E2E0D8;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.bell-badge {
  top: 6px;
  right: 7px;
  width: 7px;
  height: 7px;
  background-color: var(--color-alert-red, #E05A46);
  border-radius: 50%;
  border: 1px solid #FFFFFF;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  background-color: #D3DFDB;
  color: var(--color-brand-dark, #10312F);
  border-radius: 50%;
  border: 1px solid #C4D3CE;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  user-select: none;
}
</style>
