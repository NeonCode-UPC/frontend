import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { alertingApi } from '../infrastructure/alerting-api.js';
import { IncidentAssembler } from '../infrastructure/incident.assembler.js';

export const useAlertingStore = defineStore('alerting', () => {
    const incidents = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const activeIncidents = computed(() => incidents.value.filter(incident => incident.status === 'pending'));
    const resolvedIncidents = computed(() => incidents.value.filter(incident => incident.status === 'resolved'));
    const pendingAcknowledgements = computed(() => activeIncidents.value.filter(incident => incident.requiresAcknowledgement).length);

    async function fetchIncidents() {
        loading.value = true;
        error.value = null;
        try {
            const response = await alertingApi.incidents.getAll();
            incidents.value = IncidentAssembler.toEntities(response.data);
        } catch (requestError) {
            error.value = 'No se pudo cargar la información de alertas.';
            console.error(requestError);
        } finally {
            loading.value = false;
        }
    }

    async function acknowledgeIncident(id) {
        const acknowledgedAt = new Date().toISOString();
        await alertingApi.acknowledge(id, acknowledgedAt);
        const incident = incidents.value.find(item => item.id === id);
        if (incident) incident.acknowledgedAt = acknowledgedAt;
    }

    async function resolveIncident(id, resolution) {
        await alertingApi.resolve(id, resolution);
        const incident = incidents.value.find(item => item.id === id);
        if (incident) {
            incident.status = 'resolved';
            incident.resolution = resolution;
        }
    }

    return {
        incidents,
        loading,
        error,
        activeIncidents,
        resolvedIncidents,
        pendingAcknowledgements,
        fetchIncidents,
        acknowledgeIncident,
        resolveIncident
    };
});
