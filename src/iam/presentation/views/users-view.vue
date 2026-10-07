<script setup>
import { computed, ref } from "vue";
import { useConfirm } from "primevue";
import useIamStore from "../../application/iam.store.js";
import BaseScreen from "../../../shared/presentation/components/base-screen.vue";

const store = useIamStore();
const confirm = useConfirm();

const search = ref('');
const selectedRole = ref(null);

const roles = [
  'Administrador',
  'Supervisora hospitalaria',
  'Operador logístico'
];

const filteredUsers = computed(() => {
  const value = search.value.toLowerCase().trim();

  return store.users.filter(user => {
    const matchesSearch =
        !value ||
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value);

    const matchesRole =
        !selectedRole.value ||
        user.role === selectedRole.value;

    return matchesSearch && matchesRole;
  });
});

function confirmDelete(user) {
  confirm.require({
    message: `¿Deseas eliminar al usuario ${user.name}?`,
    header: 'Eliminar usuario',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      store.deleteUser(user);
    }
  });
}
</script>

<template>
  <base-screen
    breadcrumb="IAM / Seguridad"
    title="Usuarios y roles"
    subtitle="Directorio de personal institucional y permisos de acceso"
    :fluid="true"
  >
    <template #actions>
      <pv-button
        label="Nuevo usuario"
        icon="pi pi-plus"
      />
    </template>

    <div class="users-content flex flex-column gap-4">
      <!-- 3 KPI Cards de resumen de usuarios -->
      <div class="grid">
        <div class="col-12 md:col-4">
          <kpi-card
            :value="store.users.length"
            label="Usuarios registrados"
            icon="pi pi-users"
            subtext="Total de cuentas en la institución"
          />
        </div>

        <div class="col-12 md:col-4">
          <kpi-card
            :value="store.users.filter(user => user.status === 'Activo').length"
            label="Usuarios activos"
            accent="teal"
            icon="pi pi-user-check"
            subtext="Personal con acceso vigente"
          />
        </div>

        <div class="col-12 md:col-4">
          <kpi-card
            :value="store.users.filter(user => user.status === 'Pendiente').length"
            label="Pendientes"
            accent="amber"
            icon="pi pi-clock"
            subtext="Solicitudes en proceso de activación"
          />
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda con filter-bar en píldora -->
      <filter-bar
        v-model="search"
        placeholder="Buscar usuario, correo o rol..."
      >
        <template #filters>
          <pv-select
            v-model="selectedRole"
            :options="roles"
            placeholder="Todos los roles"
            show-clear
            class="w-full sm:w-16rem select-pill"
          />
        </template>
      </filter-bar>

      <!-- Tabla de usuarios con app-data-table médica -->
      <content-card padding="p-0" class="overflow-hidden">
        <app-data-table
          :value="filteredUsers"
          :rows="10"
          :rows-per-page-options="[5, 10, 20]"
          min-width="55rem"
          empty-title="No se encontraron usuarios"
          empty-message="Intenta con otro término de búsqueda o rol."
        >
          <!-- Columna: USUARIO (Avatar + Nombre destacado + ID) -->
          <pv-column field="name" header="USUARIO" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-3 py-1">
                <user-avatar :name="data.name" size="md" />
                <div class="flex flex-column">
                  <span class="font-bold text-main text-sm line-height-2">{{ data.name }}</span>
                  <span class="text-xs text-muted font-mono">#{{ String(data.id).padStart(3, '0') }}</span>
                </div>
              </div>
            </template>
          </pv-column>

          <!-- Columna: CORREO -->
          <pv-column field="email" header="CORREO">
            <template #body="{ data }">
              <span class="text-secondary text-sm">{{ data.email }}</span>
            </template>
          </pv-column>

          <!-- Columna: ROL -->
          <pv-column field="role" header="ROL" sortable>
            <template #body="{ data }">
              <span class="role-pill">{{ data.role }}</span>
            </template>
          </pv-column>

          <!-- Columna: INSTITUCIÓN -->
          <pv-column field="institution" header="INSTITUCIÓN">
            <template #body="{ data }">
              <span class="text-secondary text-sm font-medium">{{ data.institution }}</span>
            </template>
          </pv-column>

          <!-- Columna: ESTADO -->
          <pv-column field="status" header="ESTADO">
            <template #body="{ data }">
              <status-badge :status="data.status" />
            </template>
          </pv-column>

          <!-- Columna: ACCIONES -->
          <pv-column header="ACCIONES" style="width: 6.5rem">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <button type="button" class="action-icon-btn" title="Editar">
                  <i class="pi pi-pencil text-xs"></i>
                </button>
                <button
                  type="button"
                  class="action-icon-btn danger"
                  title="Eliminar"
                  @click="confirmDelete(data)"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>
            </template>
          </pv-column>
        </app-data-table>
      </content-card>

      <div
        v-if="store.errors.length"
        class="text-red-500 mt-2"
      >
        {{ store.errors.map(error => error.message).join(', ') }}
      </div>

      <pv-confirm-dialog />
    </div>
  </base-screen>
</template>

<style scoped>
.users-content {
  width: 100%;
}

:deep(.select-pill) {
  border-radius: 9999px !important;
  background: #FFFFFF !important;
  border: 1px solid var(--border-subtle, #E8E6DF) !important;
}

/* Píldora de Rol */
.role-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background-color: var(--bg-card-subtle, #F9F8F5);
  border: 1px solid var(--border-subtle, #E8E6DF);
  color: var(--text-main, #10312F);
  font-size: 0.75rem;
  font-weight: 600;
}

/* Botones de Acción Sutiles */
.action-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle, #E8E6DF);
  background: #FFFFFF;
  color: var(--text-secondary, #5A706A);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-icon-btn:hover {
  background: var(--bg-card-subtle, #F9F8F5);
  color: var(--color-brand-teal, #0F7A70);
  border-color: var(--color-brand-teal, #0F7A70);
}

.action-icon-btn.danger:hover {
  background: var(--color-alert-red-subtle, #FEF2F2);
  color: var(--color-alert-red, #E05A46);
  border-color: var(--color-alert-red, #E05A46);
}
</style>