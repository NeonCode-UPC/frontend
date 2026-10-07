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
      title="Suscripción"
      bounded-context="Identity, Access & Subscriptions (IAM)"
      search-placeholder="Filtrar por plan de suscripción..."
  >
    <div class="p-4">

      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="m-0">Suscripción</h2>
          <p class="text-color-secondary mt-2 mb-0">
            Administración del plan y suscripción de la institución.
          </p>
        </div>
      </div>

      <div class="grid mb-4">

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-4 shadow-1">
            <div class="text-color-secondary">
              Plan actual
            </div>

            <div class="text-xl font-bold mt-2">
              Plan Institucional
            </div>

            <pv-tag
                value="Activo"
                severity="success"
                class="mt-2"
            />
          </div>
        </div>

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-4 shadow-1">
            <div class="text-color-secondary">
              Usuarios incluidos
            </div>

            <div class="text-2xl font-bold mt-2">
              10
            </div>

            <small class="text-color-secondary">
              Usuarios permitidos por el plan
            </small>
          </div>
        </div>

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-4 shadow-1">
            <div class="text-color-secondary">
              Estado
            </div>

            <div class="text-xl font-bold mt-2">
              Suscripción activa
            </div>

            <small class="text-color-secondary">
              Renovación automática habilitada
            </small>
          </div>
        </div>

      </div>

      <div class="surface-card border-round p-4 shadow-1">

        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h3 class="m-0">Planes disponibles</h3>
            <p class="text-color-secondary mt-2 mb-0">
              Selecciona el plan que mejor se adapte a tu institución.
            </p>
          </div>
        </div>

        <div class="grid">

          <div
              v-for="plan in plans"
              :key="plan.name"
              class="col-12 md:col-4"
          >
            <div class="surface-ground border-round p-4 h-full">

              <div class="flex justify-content-between align-items-start">
                <h3 class="m-0">{{ plan.name }}</h3>

                <pv-tag
                    :value="plan.status"
                    :severity="plan.status === 'Activo' ? 'success' : 'info'"
                />
              </div>

              <p class="text-color-secondary">
                {{ plan.description }}
              </p>

              <div class="text-xl font-bold mb-2">
                {{ plan.price }}
              </div>

              <div class="text-color-secondary mb-3">
                {{ plan.users }}
              </div>

              <pv-button
                  :label="plan.status === 'Activo' ? 'Plan actual' : 'Seleccionar plan'"
                  :disabled="plan.status === 'Activo'"
                  class="w-full"
              />

            </div>
          </div>

        </div>

      </div>

    </div>
  </base-screen>
</template>