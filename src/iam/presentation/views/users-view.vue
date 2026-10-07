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

      <!-- Barra de Filtros y Búsqueda -->
      <div class="flex flex-column sm:flex-row gap-2">
        <pv-icon-field class="w-full">
          <pv-input-icon class="pi pi-search" />
          <pv-input-text
            v-model="search"
            placeholder="Buscar usuario, correo o rol..."
            class="w-full"
          />
        </pv-icon-field>

        <pv-select
          v-model="selectedRole"
          :options="roles"
          placeholder="Todos los roles"
          show-clear
          class="w-full sm:w-20rem"
        />
      </div>

      <!-- Tabla de usuarios envuelta en content-card -->
      <content-card padding="p-0" class="overflow-hidden">
        <pv-data-table
          :value="filteredUsers"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          striped-rows
          table-style="min-width: 60rem"
        >
          <pv-column
            field="id"
            header="ID"
            sortable
          />

          <pv-column
            field="name"
            header="Usuario"
            sortable
          />

          <pv-column
            field="email"
            header="Correo"
          />

          <pv-column
            field="role"
            header="Rol"
            sortable
          />

          <pv-column
            field="institution"
            header="Institución"
          />

          <pv-column
            field="status"
            header="Estado"
          >
            <template #body="slotProps">
              <status-badge :status="slotProps.data.status" />
            </template>
          </pv-column>

          <pv-column header="Acciones">
            <template #body="slotProps">
              <pv-button
                icon="pi pi-pencil"
                text
                rounded
              />

              <pv-button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                @click="confirmDelete(slotProps.data)"
              />
            </template>
          </pv-column>

          <template #empty>
            <empty-state
              title="No se encontraron usuarios"
              message="Intenta con otro término de búsqueda o rol."
            />
          </template>
        </pv-data-table>
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

:deep(.p-datatable-header) {
  background: var(--bg-card, #FFFFFF);
  border: none;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: var(--bg-card-subtle, #F9F8F5);
  color: var(--text-secondary, #5A706A);
  font-size: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
  padding: 0.85rem 1rem;
  letter-spacing: 0.02em;
}

:deep(.p-datatable-tbody > tr > td) {
  font-size: 0.8125rem;
  color: var(--text-main, #10312F);
  border-bottom: 1px solid var(--border-subtle, #E8E6DF);
  padding: 0.85rem 1rem;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #FAFAF7;
}
</style>