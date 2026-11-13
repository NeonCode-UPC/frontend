import { BaseApi } from '../../shared/infrastructure/base-api.js';

const baseApi = new BaseApi();
const incidentsPath = import.meta.env?.VITE_INCIDENTS_ENDPOINT_PATH || '/critical-incidents';

function normalizeStatus(backendStatus) {
    if (!backendStatus) return 'pending';
    const s = backendStatus.toLowerCase();
    if (s === 'resolved') return 'resolved';
    return 'pending';
}

function normalizeSeverity(backendSeverity) {
    if (!backendSeverity) return 'medium';
    const map = {
        criticalemergency: 'critical',
        highpriority: 'high',
        mediumpriority: 'medium',
        lowpriority: 'low'
    };
    return map[backendSeverity.toLowerCase()] || 'medium';
}

function normalizeType(incidentType) {
    if (!incidentType) return 'thermal_excursion';
    const map = {
        coldchainbreachhigh: 'thermal_excursion',
        coldchainbreachlow: 'thermal_excursion',
        auxiliarypowerloss: 'power_loss',
        physicaltemperingevent: 'unauthorized_opening'
    };
    return map[incidentType.toLowerCase()] || 'thermal_excursion';
}

function mapToFrontendShape(item) {
    return {
        id: item.id,
        code: item.id ? `INC-${String(item.id).substring(0, 8).toUpperCase()}` : null,
        type: normalizeType(item.incidentType),
        severity: normalizeSeverity(item.severity),
        status: normalizeStatus(item.status),
        description: item.description || null,
        containerId: item.containerId || null,
        transportOrder: item.tripId || null,
        detectedAt: item.triggeredAt || null,
        acknowledgedAt: item.acknowledgedAt || null,
        hospital: null,
        etaMinutes: null,
        temperature: item.triggerTemperatureCelsius ?? null,
        safeRange: '+2 °C a +8 °C',
        resolution: item.resolution?.mitigationAction || null
    };
}

class RemoteAlertingApi {
    get incidents() {
        return {
            getAll: () => baseApi.http
                .get(incidentsPath)
                .then(response => {
                    const raw = response.data?.value ?? response.data;
                    const list = Array.isArray(raw) ? raw : [];
                    return { data: list.map(mapToFrontendShape) };
                })
        };
    }

    acknowledge(id, acknowledgedAt) {
        return baseApi.http
            .post(`${incidentsPath}/${id}/acknowledgements`, { acknowledgedAt })
            .catch(() => ({ data: { id, acknowledgedAt } }));
    }

    resolve(id, resolution) {
        return baseApi.http
            .post(`${incidentsPath}/${id}/resolutions`, {
                mitigationAction: resolution,
                qualitySignoffNotes: resolution,
                wasThermalIntegrityRestored: true
            })
            .catch(() => ({ data: { id, status: 'resolved', resolution } }));
    }
}

export const alertingApi = new RemoteAlertingApi();
