import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const containersEndpointPath =
    import.meta.env?.VITE_CONTAINERS_ENDPOINT_PATH || '/smart-containers';

const telemetryEndpointPath =
    import.meta.env?.VITE_TELEMETRY_ENDPOINT_PATH || '/telemetry-logs';

/**
 * Infrastructure API client for the Smart Container & Telemetry Monitoring bounded context.
 * Extends BaseApi (which configures the `/api/v1` base URL) and exposes endpoint lifecycle operations.
 *
 * @class TelemetryApi
 * @extends BaseApi
 */
export class TelemetryApi extends BaseApi {
    #containersEndpoint;
    #telemetryEndpoint;

    constructor() {
        super();
        this.#containersEndpoint = new BaseEndpoint(this, containersEndpointPath);
        this.#telemetryEndpoint = new BaseEndpoint(this, telemetryEndpointPath);
    }

    /**
     * Retrieves all smart container records, optionally filtered by status or ambulancePlate.
     * @param {Object} [params]
     * @param {string} [params.status]
     * @param {string} [params.ambulancePlate]
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainers(params = {}) {
        return this.http.get(containersEndpointPath, { params });
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
        return this.http.get(`${containersEndpointPath}/serial/${encodeURIComponent(serialNumber)}`);
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
        return this.http.post(`${containersEndpointPath}/${encodeURIComponent(id)}/pair`, { ambulancePlate });
    }

    /**
     * Unlinks a SmartContainer from its ambulance (POST /api/v1/smart-containers/{id}/unlink).
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    unlinkContainer(id) {
        return this.http.post(`${containersEndpointPath}/${encodeURIComponent(id)}/unlink`);
    }

    /**
     * Records a payload weight movement (POST /api/v1/smart-containers/{id}/weight-movements).
     * @param {string|number} id
     * @param {Object} movementData
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    recordWeightMovement(id, movementData) {
        return this.http.post(`${containersEndpointPath}/${encodeURIComponent(id)}/weight-movements`, movementData);
    }

    /**
     * Applies a live environmental telemetry snapshot to a container (POST /api/v1/smart-containers/{id}/telemetry-snapshot).
     * @param {string|number} id
     * @param {Object} snapshotData
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    recordContainerTelemetrySnapshot(id, snapshotData) {
        return this.http.post(`${containersEndpointPath}/${encodeURIComponent(id)}/telemetry-snapshot`, snapshotData);
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
        return this.http.get(telemetryEndpointPath, { params });
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
        return this.http.get(telemetryEndpointPath, {
            params: { containerId }
        });
    }

    /**
     * Retrieves telemetry log snapshots filtered by trip identifier.
     * @param {string|number} tripId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogsByTripId(tripId) {
        return this.http.get(telemetryEndpointPath, {
            params: { tripId }
        });
    }

    /**
     * Retrieves the latest telemetry log for a specific container (GET /api/v1/telemetry-logs/containers/{containerId}/latest).
     * @param {string|number} containerId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getLatestTelemetryLog(containerId) {
        return this.http.get(`${telemetryEndpointPath}/containers/${encodeURIComponent(containerId)}/latest`);
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
