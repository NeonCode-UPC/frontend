import { defineStore } from "pinia";
import { ref } from "vue";

const useIamStore = defineStore('iam', () => {

    const users = ref([
        {
            id: 1,
            name: 'Luis Quispe',
            email: 'l.quispe@sanborja.pe',
            role: 'Operador logístico',
            institution: 'Clínica San Borja',
            status: 'Activo'
        },
        {
            id: 2,
            name: 'Andrea Salazar Vega',
            email: 'a.salazar@sanborja.pe',
            role: 'Supervisora hospitalaria',
            institution: 'Clínica San Borja',
            status: 'Activo'
        },
        {
            id: 3,
            name: 'Carlos Mendoza',
            email: 'c.mendoza@sanborja.pe',
            role: 'Administrador',
            institution: 'Clínica San Borja',
            status: 'Activo'
        },
        {
            id: 4,
            name: 'María Torres',
            email: 'm.torres@sanborja.pe',
            role: 'Supervisora hospitalaria',
            institution: 'Clínica San Borja',
            status: 'Pendiente'
        }
    ]);

    const errors = ref([]);

    function addUser(user) {
        user.id = users.value.length + 1;
        users.value.push(user);
    }

    function deleteUser(user) {
        const index = users.value.findIndex(item => item.id === user.id);

        if (index !== -1) {
            users.value.splice(index, 1);
        }
    }

    return {
        users,
        errors,
        addUser,
        deleteUser
    };
});

export default useIamStore;