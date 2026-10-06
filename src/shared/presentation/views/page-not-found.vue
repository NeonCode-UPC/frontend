<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const { t } = useI18n();
</script>

<template>
  <div class="text-center py-7">
    <i class="pi pi-exclamation-circle text-6xl text-red-500 mb-3"></i>
    <h1 class="text-4xl font-bold">{{ t('page-not-found.title') }}</h1>
    <p class="text-secondary text-lg mb-4">
      {{ t('page-not-found.content', { 'unavailable-route': route.path }) }}
    </p>
    <router-link to="/home">
      <pv-button :label="t('page-not-found.go-home')" icon="pi pi-home" class="bg-medical-teal border-none" />
    </router-link>
  </div>
</template>

<style scoped>
</style>
