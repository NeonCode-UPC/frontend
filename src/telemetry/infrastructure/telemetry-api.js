import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const containersEndpointPath =
    import.meta.env.VITE_CONTAINERS_ENDPOINT_PATH || '/smart-containers';

const telemetryEndpointPath =
    import.meta.env.VITE_TELEMETRY_ENDPOINT_PATH || '/telemetry-logs';

/**
 * Infrastructure API client for the Smart Container & Telemetry Monitoring bounded context.
 * Extends the shared BaseApi class and encapsulates collection endpoints.
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
     * Retrieves all smart container records.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainers() {
        return this.#containersEndpoint.getAll();
    }

    /**
     * Retrieves a single smart container by its identifier.
     * @param {string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getContainerById(id) {
        return this.#containersEndpoint.getById(id);
    }

    /**
     * Updates a smart container record (e.g., link ambulance, update movements/weight).
     * @param {string} id
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateContainer(id, resource) {
        return this.#containersEndpoint.update(id, resource);
    }

    /**
     * Retrieves all telemetry log snapshots.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogs() {
        return this.#telemetryEndpoint.getAll();
    }

    /**
     * Retrieves telemetry log snapshots filtered by container ID.
     * @param {string} containerId
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTelemetryLogsByContainerId(containerId) {
        return this.http.get(`${telemetryEndpointPath}?containerId=${containerId}`);
    }

    /**
     * Posts a new telemetry snapshot.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createTelemetryLog(resource) {
        return this.#telemetryEndpoint.create(resource);
    }
}
