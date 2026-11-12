import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const rawBaseUrl =
    import.meta.env?.VITE_TELEMETRY_API_URL ||
    import.meta.env?.VITE_API_URL ||
    'http://localhost:5261';

// Normalizes base URL: strips trailing /api/v1 so endpoints can consistently target /api/v1/...
const normalizedBaseUrl = String(rawBaseUrl).replace(/\/api\/v1\/?$/, '');

const containersEndpointPath =
    import.meta.env?.VITE_CONTAINERS_ENDPOINT_PATH || '/api/v1/smart-containers';

const telemetryEndpointPath =
    import.meta.env?.VITE_TELEMETRY_ENDPOINT_PATH || '/api/v1/telemetry-logs';

/**
 * Ensures a path starts with /api/v1 for backend REST contract compliance.
 * @param {string} path
 * @returns {string}
 */
function ensureApiPrefix(path) {
    if (!path.startsWith('/')) path = `/${path}`;
    return path.startsWith('/api/v1') ? path : `/api/v1${path}`;
}

/**
 * Infrastructure API client for the Smart Container & Telemetry Monitoring bounded context.
 * Connects directly to the ASP.NET Core REST API with full endpoint lifecycle operations.
 *
 * @class TelemetryApi
 * @extends BaseApi
 */
export class TelemetryApi extends BaseApi {
    #containersEndpoint;
    #telemetryEndpoint;
    #containersPath;
    #telemetryPath;

    constructor(baseURL = normalizedBaseUrl) {
        super(baseURL);
        this.#containersPath = ensureApiPrefix(containersEndpointPath);
        this.#telemetryPath = ensureApiPrefix(telemetryEndpointPath);
        this.#containersEndpoint = new BaseEndpoint(this, this.#containersPath);
        this.#telemetryEndpoint = new BaseEndpoint(this, this.#telemetryPath);
    }

    /**
     * Retrieves all smart container records, optionally filtered by status or ambulancePlate.
     * @param {Object} [params]
     * @param {string} [params.status]
     * @param {string} [params.ambulancePlate]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainers(params = {}) {
        return this.http.get(this.#containersPath, { params });
    }

    /**
     * Retrieves a single smart container by its identifier (numeric id or string id).
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainerById(id) {
        return this.#containersEndpoint.getById(encodeURIComponent(id));
    }

    /**
     * Retrieves a smart container by its alphanumeric serial number (e.g. SB-0182).
     * @param {string} serialNumber
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainerBySerialNumber(serialNumber) {
        return this.http.get(`${this.#containersPath}/serial/${encodeURIComponent(serialNumber)}`);
    }

    /**
     * Registers a new SmartContainer fleet unit in the backend aggregate catalog.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createContainer(resource) {
        return this.#containersEndpoint.create(resource);
    }

    /**
     * Pairs a SmartContainer to an ambulance (POST /api/v1/smart-containers/{id}/pair).
     * @param {string|number} id
     * @param {string} ambulancePlate
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    pairContainer(id, ambulancePlate) {
        return this.http.post(`${this.#containersPath}/${encodeURIComponent(id)}/pair`, { ambulancePlate });
    }

    /**
     * Unlinks a SmartContainer from its ambulance (POST /api/v1/smart-containers/{id}/unlink).
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    unlinkContainer(id) {
        return this.http.post(`${this.#containersPath}/${encodeURIComponent(id)}/unlink`);
    }

    /**
     * Records a payload weight movement (POST /api/v1/smart-containers/{id}/weight-movements).
     * @param {string|number} id
     * @param {Object} movementData
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    recordWeightMovement(id, movementData) {
        return this.http.post(`${this.#containersPath}/${encodeURIComponent(id)}/weight-movements`, movementData);
    }

    /**
     * Applies a live environmental telemetry snapshot to a container (POST /api/v1/smart-containers/{id}/telemetry-snapshot).
     * @param {string|number} id
     * @param {Object} snapshotData
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    recordContainerTelemetrySnapshot(id, snapshotData) {
        return this.http.post(`${this.#containersPath}/${encodeURIComponent(id)}/telemetry-snapshot`, snapshotData);
    }

    /**
     * Updates general container parameters (PUT /api/v1/smart-containers/{id}).
     * @param {string|number} id
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateContainer(id, resource) {
        return this.#containersEndpoint.update(encodeURIComponent(id), resource);
    }

    /**
     * Retrieves telemetry log snapshots, optionally filtered by query parameters.
     * @param {Object} [params]
     * @param {string} [params.containerId]
     * @param {string} [params.tripId]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogs(params = {}) {
        return this.http.get(this.#telemetryPath, { params });
    }

    /**
     * Retrieves a single telemetry log by its monotonic database identifier.
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogById(id) {
        return this.#telemetryEndpoint.getById(encodeURIComponent(id));
    }

    /**
     * Retrieves telemetry log snapshots filtered by container identifier (e.g. SB-0182).
     * @param {string|number} containerId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogsByContainerId(containerId) {
        return this.http.get(this.#telemetryPath, {
            params: { containerId }
        });
    }

    /**
     * Retrieves telemetry log snapshots filtered by trip identifier.
     * @param {string|number} tripId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogsByTripId(tripId) {
        return this.http.get(this.#telemetryPath, {
            params: { tripId }
        });
    }

    /**
     * Retrieves the latest telemetry log for a specific container (GET /api/v1/telemetry-logs/containers/{containerId}/latest).
     * @param {string|number} containerId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getLatestTelemetryLog(containerId) {
        return this.http.get(`${this.#telemetryPath}/containers/${encodeURIComponent(containerId)}/latest`);
    }

    /**
     * Posts a new IoT telemetry snapshot transmitted from an ESP32 microcontroller.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createTelemetryLog(resource) {
        return this.#telemetryEndpoint.create(resource);
    }
}
