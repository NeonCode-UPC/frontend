import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { alertingApi } from '../infrastructure/alerting-api.js';
import { IncidentAssembler } from '../infrastructure/incident.assembler.js';

const defaultIncidents = [
    {
        id: '1',
        code: 'INC-CRIT-001',
        type: 'thermal_excursion',
        severity: 'critical',
        status: 'pending',
        description: 'Excursión térmica prolongada sobre 8.0 °C en contenedor SB-8801.',
        containerId: 'SB-8801',
        transportOrder: 'TR-2026-8802',
        detectedAt: '2026-11-12T16:50:00Z',
        acknowledgedAt: null,
        temperature: 12.5,
        safeRange: '+2 °C a +8 °C'
    },
    {
        id: '2',
        code: 'INC-WARN-002',
        type: 'unauthorized_opening',
        severity: 'high',
        status: 'pending',
        description: 'Apertura no autorizada y sello físico roto en tránsito.',
        containerId: 'SB-8801',
        transportOrder: 'TR-2026-8803',
        detectedAt: '2026-11-12T16:55:00Z',
        acknowledgedAt: null,
        temperature: 4.0,
        safeRange: '+2 °C a +8 °C'
    }
];

export const useAlertingStore = defineStore('alerting', () => {
    const incidents = ref(IncidentAssembler.toEntities(defaultIncidents));
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
            if (response.data && response.data.length > 0) {
                incidents.value = IncidentAssembler.toEntities(response.data);
            }
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
