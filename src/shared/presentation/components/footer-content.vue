<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="w-full bg-medical-navy text-white p-4 mt-6 border-top-1 border-gray-700">
    <div class="flex flex-column md:flex-row align-items-center justify-content-between max-w-7xl mx-auto gap-3">
      <div class="flex align-items-center gap-2">
        <img src="/logo.png" alt="Medical SMARTBOX" class="h-2rem w-auto border-circle" />
        <span class="font-bold text-sm tracking-wide">Medical SMARTBOX</span>
        <span class="text-xs text-gray-400">| © 2026 NeonCode</span>
      </div>

      <div class="text-center text-xs text-gray-300">
        {{ t('authoring-phrase.intro') }}
        {{ t('authoring-phrase.use') }}
        <a href="https://primevue.org/" target="_blank" rel="noopener noreferrer" class="text-white font-bold underline hover:text-green-300">
          PrimeVue
        </a>
        {{ t('authoring-phrase.author', { brand: 'NeonCode' }) }}
      </div>

      <div class="flex align-items-center gap-2 text-xs text-green-300 font-semibold">
        <i class="pi pi-shield"></i>
        <span>R.M. N° 833-2015/MINSA</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
</style>
