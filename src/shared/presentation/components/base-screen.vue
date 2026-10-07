<script setup>
import { onMounted } from 'vue';
import { useLayoutHeader } from '../../composables/use-layout-header.js';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  breadcrumb: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  boundedContext: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Filtrar por ruta, estado o código...'
  },
  fluid: {
    type: Boolean,
    default: true
  }
});

const { searchQuery, configureHeader } = useLayoutHeader();

onMounted(() => {
  configureHeader({
    placeholder: props.searchPlaceholder,
    visible: true
  });
});
</script>

<template>
  <div class="base-screen flex flex-column gap-3 w-full">
    <!-- Header Estandarizado de Página -->
    <header class="screen-header flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
      <div>
        <span v-if="breadcrumb" class="breadcrumb-text text-xs text-muted block mb-1">
          {{ breadcrumb }}
        </span>
        <h1 class="screen-title text-2xl md:text-3xl font-bold text-main m-0 line-height-1">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="screen-subtitle text-xs text-muted mt-1 mb-0">
          {{ subtitle }}
        </p>
      </div>

      <!-- Acciones de Cabecera (Botones, Filtros, Badges) -->
      <div v-if="$slots.actions" class="screen-actions flex align-items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <!-- Indicador reactivo de búsqueda activa (si el usuario escribe en el header) -->
    <div v-if="searchQuery" class="active-filter-indicator text-xs text-muted">
      Filtrando por: <strong class="text-main">"{{ searchQuery }}"</strong>
    </div>

    <!-- Canvas de Contenido -->
    <div v-if="!fluid" class="screen-card p-4 border-round-xl">
      <slot :search-query="searchQuery">
        <p class="text-muted text-xs m-0">
          Espacio de trabajo listo para la implementación de las vistas de este Bounded Context.
        </p>
      </slot>
    </div>
    <div v-else class="screen-body w-full">
      <slot :search-query="searchQuery">
        <p class="text-muted text-xs m-0">
          Espacio de trabajo listo para la implementación de las vistas de este Bounded Context.
        </p>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.base-screen {
  width: 100%;
}

.breadcrumb-text {
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.screen-title {
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.screen-subtitle {
  color: var(--text-secondary);
  line-height: 1.4;
}

.screen-actions {
  flex-shrink: 0;
}
</style>
