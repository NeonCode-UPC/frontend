<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="surface-card border-round-xl p-5 shadow-1 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-3">{{ t('about.title') }}</h1>
    <p class="text-secondary text-lg line-height-3 mb-4">{{ t('about.content') }}</p>

    <div class="grid mt-4">
      <div class="col-12 md:col-6">
        <pv-card class="h-full border-1 surface-border">
          <template #title>Normativa Sanitaria</template>
          <template #content>
            <ul class="text-secondary text-sm line-height-3 pl-3">
              <li><strong>R.M. N° 833-2015/MINSA:</strong> Directiva para almacenamiento y cadena de frío de productos biológicos (+2 °C a +8 °C).</li>
              <li><strong>Directiva Sanitaria N° 152/MINSA:</strong> Control del tiempo de isquemia fría en trasplantes de órganos humanos.</li>
            </ul>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-6">
        <pv-card class="h-full border-1 surface-border">
          <template #title>Startup NeonCode</template>
          <template #content>
            <p class="text-secondary text-sm line-height-3">
              Equipo de ingeniería de software comprometido con la innovación en telemetría IoT asistencial, optimización del tránsito en Lima y seguridad clínica hospitalaria.
            </p>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
