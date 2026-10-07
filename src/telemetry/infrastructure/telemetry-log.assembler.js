import { TelemetryLog } from "../domain/telemetry-log.entity.js";
import { TelemetryLogResource } from "./telemetry-log.resource.js";

/**
 * Maps TelemetryLog resources into domain entities.
 *
 * @class TelemetryLogAssembler
 */
export class TelemetryLogAssembler {
    /**
     * Converts a raw resource into a TelemetryLog domain entity.
     *
     * @param {TelemetryLogResource|Object} resource
     * @returns {TelemetryLog}
     */
    static toEntityFromResource(resource) {
        return new TelemetryLog({ ...resource });
    }

    /**
     * Converts an Axios HTTP response into an array of TelemetryLog entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {TelemetryLog[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || response.status !== 200) {
            console.error(response ? `Status: ${response.status}` : 'No response');
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data['telemetry-logs'] || [];

        return resources.map(resource =>
            this.toEntityFromResource(new TelemetryLogResource(resource))
        );
    }
}
