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

function isItemActive(path) {
  if (path === '/home') {
    return route.path === '/home' || route.path === '/';
  }
  if (route.path === path) return true;
  const deepestMatch = menuGroups
    .flatMap((group) => group.items)
    .filter((item) => route.path === item.to || route.path.startsWith(`${item.to}/`))
    .sort((left, right) => right.to.length - left.to.length)[0];
  return deepestMatch?.to === path;
}
</script>

<template>
  <aside class="sidebar-container flex flex-column select-none">
    <!-- Top Pill: Panel -->
    <div class="px-2 pt-2 pb-1">
      <router-link
        to="/home"
        class="nav-item flex align-items-center gap-2 px-3 py-2 border-round-3xl no-underline"
        :class="isItemActive('/home') ? 'active-pill' : 'inactive-item'"
      >
        <i class="pi pi-th-large text-sm"></i>
        <span>Panel</span>
      </router-link>
    </div>

    <!-- Navigation Scrollable Area -->
    <nav class="flex-1 overflow-y-auto px-2 pb-4 flex flex-column gap-2 sidebar-scroll">
      <div v-for="group in menuGroups" :key="group.category" class="flex flex-column gap-1">
        <!-- Category Title -->
        <span class="category-header px-3 pt-2">
          {{ group.category }}
        </span>

        <!-- Menu Item -->
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-item flex align-items-center gap-2 px-3 py-2 border-round-3xl no-underline"
          :class="isItemActive(item.to) ? 'active-pill' : 'inactive-item'"
        >
          <i :class="[item.icon, 'text-sm']"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-container {
  width: 200px;
  min-width: 200px;
  background-color: var(--color-brand-dark, #10312F);
  height: calc(100vh - 54px);
}

.category-header {
  color: #5A7C75;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding-inline: 0.75rem !important;
}

.nav-item {
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  padding: 0.45rem 0.75rem !important;
}

.inactive-item {
  color: #B8CBC6;
}

.inactive-item:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #FFFFFF;
}

.active-pill {
  background-color: var(--color-brand-mint, #B9DDA0) !important;
  color: #10312F !important;
  font-weight: 700 !important;
}

.active-pill i {
  color: #10312F !important;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 3px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}
</style>
