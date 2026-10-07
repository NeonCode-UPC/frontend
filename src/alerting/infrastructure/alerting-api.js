import { incidentMocks } from './mock/incidents.mock.js';

const STORAGE_KEY = 'medical-smartbox:critical-incidents';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadIncidents() {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
        const initialIncidents = clone(incidentMocks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIncidents));
        return initialIncidents;
    }

    try {
        return JSON.parse(storedValue);
    } catch {
        const initialIncidents = clone(incidentMocks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIncidents));
        return initialIncidents;
    }
}

function persistIncidents(incidents) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

function updateIncident(id, changes) {
    const incidents = loadIncidents();
    const incidentIndex = incidents.findIndex(incident => String(incident.id) === String(id));

    if (incidentIndex < 0) {
        return Promise.reject(new Error(`Incident ${id} was not found`));
    }

    incidents[incidentIndex] = { ...incidents[incidentIndex], ...changes };
    persistIncidents(incidents);
    return Promise.resolve({ data: clone(incidents[incidentIndex]) });
}

class LocalAlertingApi {
    constructor() {
        this.incidents = {
            getAll: () => Promise.resolve({ data: clone(loadIncidents()) })
        };
    }

    acknowledge(id, acknowledgedAt) {
        return updateIncident(id, { acknowledgedAt });
    }

    resolve(id, resolution) {
        return updateIncident(id, {
            status: 'resolved',
            resolution,
            resolvedAt: new Date().toISOString()
        });
    }
}

export const alertingApi = new LocalAlertingApi();
