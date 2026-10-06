<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLayoutHeader } from '../../composables/use-layout-header.js';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  boundedContext: {
    type: String,
    required: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Filtrar por ruta, estado o SmartBox'
  }
});

const route = useRoute();
const { searchQuery, configureHeader } = useLayoutHeader();

onMounted(() => {
  configureHeader({
    placeholder: props.searchPlaceholder,
    visible: true
  });
});
</script>

<template>
  <div class="flex flex-column gap-3">
    <!-- Clean Minimal Header -->
    <div>
      <h1 class="text-2xl font-bold text-main m-0">
        {{ title }}
      </h1>
      <div class="flex align-items-center gap-2 mt-1 text-xs text-muted">
        <span>Bounded Context: <strong class="text-teal">{{ boundedContext }}</strong></span>
        <span>·</span>
        <span>Ruta: <code class="font-mono text-main">{{ route.path }}</code></span>
      </div>
    </div>

    <!-- Active Filter Text (if user types in header search) -->
    <div v-if="searchQuery" class="text-xs text-muted">
      Filtrando por: <strong class="text-main">"{{ searchQuery }}"</strong>
    </div>

    <!-- Empty Clean Canvas for the Team Member -->
    <div class="screen-card p-4 border-round-xl">
      <slot :search-query="searchQuery">
        <p class="text-muted text-xs m-0">
          Espacio de trabajo listo para la implementación de las vistas de este Bounded Context.
        </p>
      </slot>
    </div>
  </div>
</template>

<style scoped>
</style>
