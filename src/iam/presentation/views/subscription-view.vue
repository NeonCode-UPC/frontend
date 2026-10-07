<script setup>
import BaseScreen from '../../../shared/presentation/components/base-screen.vue';

const plans = [
  {
    name: 'Plan Institucional',
    description: 'Gestión completa para instituciones médicas.',
    users: 'Hasta 10 usuarios',
    status: 'Activo',
    price: 'S/ 299 / mes'
  },
  {
    name: 'Plan Profesional',
    description: 'Para equipos pequeños de operación.',
    users: 'Hasta 5 usuarios',
    status: 'Disponible',
    price: 'S/ 199 / mes'
  },
  {
    name: 'Plan Básico',
    description: 'Funciones esenciales de Medical SmartBox.',
    users: 'Hasta 2 usuarios',
    status: 'Disponible',
    price: 'S/ 99 / mes'
  }
];
</script>

<template>
  <base-screen
    breadcrumb="IAM / Suscripción"
    title="Suscripción institucional"
    subtitle="Administración del plan activo y capacidad de usuarios"
    :fluid="true"
  >
    <div class="subscription-content flex flex-column gap-4">
      <!-- Resumen de organización y capacidad con KPI Cards -->
      <div class="grid">
        <div class="col-12 md:col-4">
          <kpi-card
            value="Clínica San Borja"
            label="Organización"
            icon="pi pi-building"
            subtext="Institución de salud vinculada"
          />
        </div>

        <div class="col-12 md:col-4">
          <kpi-card
            value="Plan Institucional"
            label="Plan actual"
            accent="teal"
            icon="pi pi-shield"
            subtext="Suscripción activa y vigente"
          />
        </div>

        <div class="col-12 md:col-4">
          <kpi-card
            value="8 / 10"
            label="Usuarios activos"
            icon="pi pi-users"
            subtext="Capacidad de usuarios del plan"
          />
        </div>
      </div>

      <!-- Catálogo de planes institucionales -->
      <section class="plans-section">
        <div class="section-heading mb-3">
          <h2 class="text-base md:text-lg font-bold text-main m-0">Planes disponibles</h2>
          <p class="text-xs text-muted m-0 mt-1">Selecciona el plan que mejor se adapte a tu institución.</p>
        </div>

        <div class="grid">
          <div
            v-for="plan in plans"
            :key="plan.name"
            class="col-12 md:col-4"
          >
            <content-card
              :title="plan.name"
              class="h-full plan-card"
              :class="{ 'active-plan-card': plan.status === 'Activo' }"
            >
              <template #header-actions>
                <status-badge :status="plan.status" />
              </template>

              <div class="plan-body flex flex-column justify-content-between h-full">
                <div>
                  <p class="plan-description text-xs text-muted mt-0 mb-3 line-height-3">
                    {{ plan.description }}
                  </p>

                  <div class="plan-price text-2xl font-bold text-main mb-2">
                    {{ plan.price }}
                  </div>

                  <div class="plan-users text-xs text-muted mb-4 flex align-items-center gap-2">
                    <i class="pi pi-users text-sm"></i>
                    <span>{{ plan.users }}</span>
                  </div>
                </div>

                <pv-button
                  :label="plan.status === 'Activo' ? 'Plan actual' : 'Seleccionar plan'"
                  :disabled="plan.status === 'Activo'"
                  class="w-full"
                />
              </div>
            </content-card>
          </div>
        </div>
      </section>
    </div>
  </base-screen>
</template>

<style scoped>
.subscription-content {
  width: 100%;
}

.plan-card {
  border: 1px solid var(--border-subtle, #E8E6DF);
  background-color: var(--bg-card, #FFFFFF);
  transition: all 0.2s ease-in-out;
}

.plan-card.active-plan-card {
  border: 2px solid var(--color-brand-teal, #0F7A70);
  background-color: var(--bg-card, #FFFFFF);
}

.plan-price {
  letter-spacing: -0.02em;
}
</style>