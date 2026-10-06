<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const contexts = [
  {
    title: 'IAM & Subscripciones',
    desc: 'Autenticación, roles de usuario y planes de suscripción.',
    to: '/iam',
    icon: 'pi pi-id-card',
    badge: 'src/iam/'
  },
  {
    title: 'Smart Container & Telemetría IoT',
    desc: 'Supervisión de sensores de temperatura (+2°C a +8°C), batería y peso.',
    to: '/telemetry',
    icon: 'pi pi-box',
    badge: 'src/telemetry/'
  },
  {
    title: 'Planificación & Despacho de Transporte',
    desc: 'Órdenes clínicas, flota de ambulancias y control de isquemia fría.',
    to: '/transport',
    icon: 'pi pi-truck',
    badge: 'src/transport/'
  },
  {
    title: 'Alertas Críticas & Incidentes',
    desc: 'Detección de excursiones térmicas, fallas de 12V y contingencias.',
    to: '/alerting',
    icon: 'pi pi-exclamation-triangle',
    badge: 'src/alerting/'
  },
  {
    title: 'Cadena de Custodia & Trazabilidad',
    desc: 'Protocolo de entrega con código OTP y actas digitales MINSA.',
    to: '/custody',
    icon: 'pi pi-lock',
    badge: 'src/custody/'
  }
];
</script>

<template>
  <div class="flex flex-column gap-4">
    <div class="surface-card border-round-xl p-5 shadow-1">
      <h1 class="text-3xl font-bold mb-2">Medical SMARTBOX — Panel de Desarrollo</h1>
      <p class="text-secondary text-base m-0">
        Plantilla base estructurada por <strong>Bounded Contexts</strong> según Domain-Driven Design (DDD). Cada integrante del equipo puede desarrollar sus componentes y vistas dentro de su contexto asignado.
      </p>
    </div>

    <div class="grid">
      <div v-for="ctx in contexts" :key="ctx.to" class="col-12 md:col-6 lg:col-4">
        <pv-card class="h-full shadow-1 hover:shadow-3 transition-duration-150">
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <span class="text-lg font-bold text-teal-900">{{ ctx.title }}</span>
              <i :class="ctx.icon + ' text-teal-700 text-xl'"></i>
            </div>
          </template>
          <template #subtitle>
            <span class="font-mono text-xs text-secondary">{{ ctx.badge }}</span>
          </template>
          <template #content>
            <p class="text-secondary text-sm my-2">{{ ctx.desc }}</p>
          </template>
          <template #footer>
            <router-link :to="ctx.to">
              <pv-button label="Ir al Bounded Context" icon="pi pi-arrow-right" iconPos="right" size="small" class="w-full bg-medical-teal border-none" />
            </router-link>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
