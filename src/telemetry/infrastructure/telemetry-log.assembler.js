import { TelemetryLog } from "../domain/telemetry-log.entity.js";
import { TelemetryLogResource } from "./telemetry-log.resource.js";

/**
 * Maps TelemetryLog resources into domain entities and vice versa.
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
        return new TelemetryLog(new TelemetryLogResource(resource));
    }

    /**
     * Converts a TelemetryLog entity into a REST payload matching `CreateTelemetryLogResource` / `telemetry_logs`.
     *
     * @param {TelemetryLog} entity
     * @returns {Object}
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            containerId: entity.containerId,
            tripId: entity.tripId,
            timestampUtc: entity.timestampUtc,
            temperatureCelsius: entity.temperatureCelsius,
            ambientTemperatureCelsius: entity.ambientTemperatureCelsius,
            weightGrams: entity.weightGrams,
            batteryPercentage: entity.batteryPercentage,
            is12vConnected: entity.is12vConnected,
            peltierPowerPct: entity.peltierPowerPct,
            lidLockEngaged: entity.lidLockEngaged,
            latitude: entity.latitude,
            longitude: entity.longitude,
            firmwareSignature: entity.firmwareSignature,
            isThermalExcursion: entity.isThermalExcursion
        };
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

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
