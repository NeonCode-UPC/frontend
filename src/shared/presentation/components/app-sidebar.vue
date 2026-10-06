<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const menuGroups = [
  {
    category: 'OPERACIONES',
    items: [
      { label: 'Traslados', to: '/transport', icon: 'pi pi-send' },
      { label: 'Ruta y ETA', to: '/transport/routes', icon: 'pi pi-compass' }
    ]
  },
  {
    category: 'FLOTA',
    items: [
      { label: 'Ambulancias', to: '/transport/ambulances', icon: 'pi pi-car' },
      { label: 'SmartBox', to: '/telemetry', icon: 'pi pi-box' }
    ]
  },
  {
    category: 'MONITOREO',
    items: [
      { label: 'Telemetría', to: '/telemetry/live', icon: 'pi pi-chart-line' }
    ]
  },
  {
    category: 'ALERTAS',
    items: [
      { label: 'Alertas', to: '/alerting', icon: 'pi pi-exclamation-circle' },
      { label: 'Incidentes', to: '/alerting/incidents', icon: 'pi pi-history' }
    ]
  },
  {
    category: 'TRAZABILIDAD',
    items: [
      { label: 'Cadena de custodia', to: '/custody', icon: 'pi pi-lock' },
      { label: 'Actas digitales', to: '/custody/records', icon: 'pi pi-file' },
      { label: 'Auditoría', to: '/custody/audit', icon: 'pi pi-check-square' }
    ]
  },
  {
    category: 'REPORTES',
    items: [
      { label: 'Reportes', to: '/reports', icon: 'pi pi-chart-bar' }
    ]
  },
  {
    category: 'ADMINISTRACIÓN',
    items: [
      { label: 'Usuarios y roles', to: '/iam/users', icon: 'pi pi-users' },
      { label: 'Suscripción', to: '/iam/subscription', icon: 'pi pi-credit-card' }
    ]
  },
  {
    category: 'CUENTA',
    items: [
      { label: 'Ajustes', to: '/settings', icon: 'pi pi-cog' }
    ]
  }
];

function isPathActive(targetPath) {
  if (targetPath === '/home') {
    return route.path === '/home' || route.path === '/';
  }
  return route.path === targetPath;
}
</script>

<template>
  <aside class="sidebar-container flex flex-column h-screen select-none">
    <!-- Top Pill: Panel (Dashboard) -->
    <div class="px-3 pt-3 pb-2">
      <router-link
        to="/home"
        class="flex align-items-center gap-3 px-3 py-2 border-round-3xl transition-colors no-underline font-bold text-sm"
        :class="isPathActive('/home') ? 'bg-mint-active text-dark-active' : 'text-nav-inactive hover:bg-nav-hover'"
      >
        <i class="pi pi-th-large text-base"></i>
        <span>Panel</span>
      </router-link>
    </div>

    <!-- Categorized Menu Navigation (Scrollable) -->
    <nav class="flex-1 overflow-y-auto px-3 pb-4 flex flex-column gap-3 custom-scrollbar">
      <div v-for="group in menuGroups" :key="group.category" class="flex flex-column gap-1">
        <!-- Section Header -->
        <span class="text-category px-3 pt-2 font-bold uppercase tracking-wider">
          {{ group.category }}
        </span>

        <!-- Section Navigation Items -->
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="flex align-items-center gap-3 px-3 py-2 border-round-3xl transition-colors no-underline text-xs font-semibold"
          :class="isPathActive(item.to) ? 'bg-mint-active text-dark-active font-bold' : 'text-nav-inactive hover:bg-nav-hover'"
        >
          <i :class="item.icon + ' text-sm'"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-container {
  width: 230px;
  min-width: 230px;
  background-color: #0B2822;
  color: #c2d6d0;
}

.text-category {
  color: #64877F;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
}

.text-nav-inactive {
  color: #C1D4CF;
}

.hover\:bg-nav-hover:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.bg-mint-active {
  background-color: #B9DDA0 !important;
}

.text-dark-active {
  color: #0A2521 !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
</style>
