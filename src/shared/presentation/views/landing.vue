<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const demoForm = ref({
  institutionName: '',
  ruc: '',
  contactEmail: '',
  fleetSize: null,
  comments: ''
});

const formSubmitted = ref(false);

const submitDemo = () => {
  if (demoForm.value.institutionName && demoForm.value.contactEmail) {
    formSubmitted.value = true;
  }
};

const faqs = [
  {
    q: "¿Cómo garantiza Medical SMARTBOX la cadena de frío según R.M. N° 833-2015/MINSA?",
    a: "El contenedor isotérmico integra refrigeración activa Peltier y sensores de temperatura redundantes que transmiten telemetría cada 10 segundos, asegurando el rango regulatorio de +2.0 °C a +8.0 °C."
  },
  {
    q: "¿Qué sucede si la ambulancia sufre un corte eléctrico de 12V en ruta?",
    a: "Cada SmartBox cuenta con una batería interna de respaldo LiFePO4 de hasta 6 horas de autonomía, activando inmediatamente una alerta crítica en la central de monitoreo."
  },
  {
    q: "¿Cómo funciona el protocolo de custodia con código OTP en quirófano?",
    a: "Al arribar al hospital de destino, el médico receptor recibe un token criptográfico OTP de 6 dígitos que digita en la terminal o la app para accionar el desbloqueo del cerrojo de la tapa."
  }
];
</script>

<template>
  <div class="flex flex-column gap-6">
    <!-- Hero Section -->
    <div class="surface-card border-round-xl p-5 md:p-7 shadow-2 text-center bg-gradient-to-r from-teal-900 to-slate-900 text-white">
      <pv-tag severity="info" class="mb-3 font-semibold text-xs uppercase tracking-wider">
        {{ t('landing.hero-badge') }}
      </pv-tag>
      <h1 class="text-4xl md:text-6xl font-extrabold text-white line-height-1 mb-4">
        {{ t('landing.hero-title') }}
      </h1>
      <p class="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto line-height-3 mb-5">
        {{ t('landing.hero-subtitle') }}
      </p>
      <div class="flex flex-wrap justify-content-center gap-3">
        <a href="#demo-section">
          <pv-button :label="t('landing.request-demo')" icon="pi pi-envelope" size="large" class="bg-medical-teal border-none font-bold" />
        </a>
        <router-link to="/telemetry">
          <pv-button :label="t('landing.explore-specs')" icon="pi pi-box" size="large" severity="secondary" outlined class="text-white border-white" />
        </router-link>
      </div>
    </div>

    <!-- Value Proposition Section (US04) -->
    <div class="grid align-items-stretch">
      <div class="col-12 md:col-4">
        <pv-card class="h-full border-1 surface-border shadow-1">
          <template #header>
            <div class="p-3 text-center bg-teal-50 border-round-top">
              <i class="pi pi-shield text-4xl text-teal-700"></i>
            </div>
          </template>
          <template #title>Custodia Ininterrumpida</template>
          <template #content>
            <p class="text-secondary text-sm">Control estricto de temperatura de +2°C a +8°C para sangre, tejidos y vacunas, cumpliendo la normativa nacional de salud.</p>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-4">
        <pv-card class="h-full border-1 surface-border shadow-1">
          <template #header>
            <div class="p-3 text-center bg-blue-50 border-round-top">
              <i class="pi pi-map-marker text-4xl text-blue-700"></i>
            </div>
          </template>
          <template #title>Rastreo y Preaviso de Ruta</template>
          <template #content>
            <p class="text-secondary text-sm">Preaviso hospitalario de 10 minutos antes del arribo y mitigación ante la congestión vehicular de Lima Metropolitana.</p>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-4">
        <pv-card class="h-full border-1 surface-border shadow-1">
          <template #header>
            <div class="p-3 text-center bg-indigo-50 border-round-top">
              <i class="pi pi-lock text-4xl text-indigo-700"></i>
            </div>
          </template>
          <template #title>Apertura Segura OTP</template>
          <template #content>
            <p class="text-secondary text-sm">Cierre electromecánico con código de un solo uso que previene manipulaciones y genera actas de auditoría digital inmutables.</p>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Corporate Demo Request (US05) -->
    <div id="demo-section" class="surface-card border-round-xl p-5 shadow-2">
      <h2 class="text-2xl font-bold mb-2">{{ t('landing.contact-title') }}</h2>
      <p class="text-secondary mb-4">Complete los datos de su clínica o empresa de ambulancias para coordinar una prueba piloto de Medical SMARTBOX.</p>

      <div v-if="formSubmitted" class="p-4 bg-green-50 text-green-900 border-round mb-3">
        <i class="pi pi-check-circle mr-2 text-green-600"></i>
        <strong>¡Solicitud enviada con éxito!</strong> Un asesor técnico de NeonCode se contactará a la brevedad.
      </div>

      <form v-else @submit.prevent="submitDemo" class="grid formgrid p-fluid">
        <div class="field col-12 md:col-6">
          <label for="instName" class="font-medium">Nombre de la Institución / Clínica</label>
          <pv-input-text id="instName" v-model="demoForm.institutionName" placeholder="Ej. Clínica San Pablo" required />
        </div>
        <div class="field col-12 md:col-6">
          <label for="ruc" class="font-medium">RUC Institucional</label>
          <pv-input-text id="ruc" v-model="demoForm.ruc" placeholder="Ej. 20123456789" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="email" class="font-medium">Correo Electrónico Corporativo</label>
          <pv-input-text id="email" v-model="demoForm.contactEmail" type="email" placeholder="contacto@clinica.pe" required />
        </div>
        <div class="field col-12 md:col-6">
          <label for="fleet" class="font-medium">Número Estimado de Ambulancias</label>
          <pv-input-number id="fleet" v-model="demoForm.fleetSize" :min="1" :max="100" placeholder="Ej. 5" />
        </div>
        <div class="field col-12">
          <label for="comments" class="font-medium">Requerimientos Particulares</label>
          <pv-textarea id="comments" v-model="demoForm.comments" rows="3" placeholder="Detalle si requiere transporte de hemoderivados, órganos o cadena de frío para vacunas." />
        </div>
        <div class="col-12 mt-2">
          <pv-button type="submit" label="Enviar Solicitud de Demostración" icon="pi pi-send" class="bg-medical-teal border-none font-bold" />
        </div>
      </form>
    </div>

    <!-- FAQ Accordion (US06) -->
    <div class="surface-card border-round-xl p-5 shadow-1">
      <h2 class="text-2xl font-bold mb-4">{{ t('landing.faq-title') }}</h2>
      <div class="flex flex-column gap-3">
        <div v-for="(faq, idx) in faqs" :key="idx" class="border-bottom-1 surface-border pb-3">
          <h3 class="text-lg font-bold text-teal-900 mb-1 flex align-items-center gap-2">
            <i class="pi pi-question-circle text-teal-600"></i>
            {{ faq.q }}
          </h3>
          <p class="text-secondary text-sm mt-1 line-height-3 pl-4">{{ faq.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
