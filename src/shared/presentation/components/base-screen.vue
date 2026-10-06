<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLayoutHeader } from '../../composables/use-layout-header.js';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  breadcrumb: {
    type: String,
    default: 'Panel'
  },
  boundedContext: {
    type: String,
    required: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Filtrar por ruta, estado o SmartBox'
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'pi pi-plus'
  }
});

const emit = defineEmits(['action']);

const route = useRoute();
const { searchQuery, configureHeader, clearSearch } = useLayoutHeader();

onMounted(() => {
  configureHeader({
    placeholder: props.searchPlaceholder,
    visible: true
  });
});

watch(() => props.searchPlaceholder, (newPlaceholder) => {
  if (newPlaceholder) {
    configureHeader({ placeholder: newPlaceholder });
  }
});
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Breadcrumb & Title Section -->
    <div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-3">
      <div>
        <span class="text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
          {{ breadcrumb }}
        </span>
        <h1 class="text-3xl font-extrabold text-900 m-0 line-height-1">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-sm text-secondary mt-2 mb-0">
          {{ subtitle }}
        </p>
      </div>

      <!-- Action Button (optional) -->
      <div v-if="actionLabel || $slots.action">
        <slot name="action">
          <pv-button
            :label="actionLabel"
            :icon="actionIcon"
            class="bg-medical-teal border-none text-white font-semibold px-4 py-2 border-round-xl shadow-1"
            @click="emit('action')"
          />
        </slot>
      </div>
    </div>

    <!-- Technical DDD Info Card (Guidance for the developer) -->
    <div class="surface-card border-round-xl p-3 border-1 surface-border shadow-1 flex flex-wrap justify-content-between align-items-center gap-2">
      <div class="flex align-items-center gap-2 flex-wrap">
        <pv-tag severity="info" class="font-bold text-xs uppercase px-2 py-1">
          Bounded Context
        </pv-tag>
        <span class="font-bold text-sm text-900">{{ boundedContext }}</span>
      </div>

      <div class="flex align-items-center gap-2 text-xs text-secondary font-mono">
        <span>Ruta:</span>
        <span class="bg-gray-100 text-teal-800 px-2 py-1 border-round font-bold">{{ route.path }}</span>
      </div>
    </div>

    <!-- Active Search Filter Pill (Reactive from Top Header Search) -->
    <div v-if="searchQuery" class="flex align-items-center gap-2 bg-teal-50 border-1 border-teal-200 px-3 py-2 border-round-lg text-sm text-teal-900">
      <i class="pi pi-filter text-teal-700"></i>
      <span>Filtrando resultados por: <strong>"{{ searchQuery }}"</strong></span>
      <pv-button icon="pi pi-times" text rounded size="small" class="p-0 ml-auto text-teal-700" @click="clearSearch" />
    </div>

    <!-- Screen Custom Content Slot -->
    <div>
      <slot :search-query="searchQuery"></slot>
    </div>
  </div>
</template>

<style scoped>
</style>
