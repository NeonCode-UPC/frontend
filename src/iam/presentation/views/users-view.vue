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
      title="Usuarios y roles"
      bounded-context="Identity, Access & Subscriptions (IAM)"
      search-placeholder="Filtrar por usuario o rol..."
  >

    <div class="p-4">

      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="m-0">Usuarios y roles</h2>
          <p class="text-color-secondary mt-2 mb-0">
            Administración de usuarios y permisos de acceso.
          </p>
        </div>

        <pv-button
            label="Nuevo usuario"
            icon="pi pi-plus"
        />
      </div>

      <div class="grid mb-4">

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-3 shadow-1">
            <div class="text-color-secondary">
              Usuarios registrados
            </div>
            <div class="text-2xl font-bold mt-2">
              {{ store.users.length }}
            </div>
          </div>
        </div>

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-3 shadow-1">
            <div class="text-color-secondary">
              Usuarios activos
            </div>
            <div class="text-2xl font-bold mt-2">
              {{ store.users.filter(user => user.status === 'Activo').length }}
            </div>
          </div>
        </div>

        <div class="col-12 md:col-4">
          <div class="surface-card border-round p-3 shadow-1">
            <div class="text-color-secondary">
              Pendientes
            </div>
            <div class="text-2xl font-bold mt-2">
              {{ store.users.filter(user => user.status === 'Pendiente').length }}
            </div>
          </div>
        </div>

      </div>

      <div class="flex gap-2 mb-3">

        <pv-input-text
            v-model="search"
            placeholder="Buscar usuario, correo o rol..."
            class="w-full"
        />

        <pv-select
            v-model="selectedRole"
            :options="roles"
            placeholder="Todos los roles"
            show-clear
            class="w-20rem"
        />

      </div>

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
            <pv-tag
                :value="slotProps.data.status"
                :severity="slotProps.data.status === 'Activo' ? 'success' : 'warn'"
            />
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

      </pv-data-table>

      <div
          v-if="store.errors.length"
          class="text-red-500 mt-3"
      >
        {{ store.errors.map(error => error.message).join(', ') }}
      </div>

      <pv-confirm-dialog />

    </div>

  </base-screen>
</template>