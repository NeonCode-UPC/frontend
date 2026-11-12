import { SmartContainer } from "../domain/smart-container.entity.js";
import { SmartContainerResource } from "./smart-container.resource.js";

/**
 * Maps SmartContainer resources from infrastructure into domain entities and vice versa.
 *
 * @class SmartContainerAssembler
 */
export class SmartContainerAssembler {
    /**
     * Converts a resource into a SmartContainer entity.
     *
     * @param {SmartContainerResource|Object} resource
     * @returns {SmartContainer}
     */
    static toEntityFromResource(resource) {
        return new SmartContainer(new SmartContainerResource(resource));
    }

    /**
     * Converts a SmartContainer entity into a normalized resource payload for API persistence.
     *
     * @param {SmartContainer} entity
     * @returns {Object}
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            serialNumber: entity.serialNumber,
            formFactor: entity.formFactor,
            containerStatus: entity.containerStatus,
            lockState: entity.lockState,
            currentTemperatureCelsius: entity.currentTemperatureCelsius ?? entity.currentTemperature,
            tareWeightGrams: entity.tareWeightGrams,
            netWeightGrams: entity.netWeightGrams,
            batteryPercentage: entity.batteryPercentage ?? entity.batteryLevel,
            is12vConnected: entity.is12vConnected,
            lastTelemetryAt: entity.lastTelemetryAt,
            createdAt: entity.createdAt,
            updatedAt: new Date().toISOString(),
            model: entity.model,
            ambulancePlate: entity.ambulancePlate,
            currentTransferId: entity.currentTransferId,
            currentTemperature: entity.currentTemperature,
            targetMinTemperature: entity.targetMinTemperature,
            targetMaxTemperature: entity.targetMaxTemperature,
            batteryLevel: entity.batteryLevel,
            lidStatus: entity.lidStatus,
            netWeight: entity.netWeight,
            tareWeight: entity.tareWeight,
            signalQuality: entity.signalQuality,
            location: entity.location,
            status: entity.status,
            lastPing: entity.lastPing,
            unitWeight: entity.unitWeight,
            estimatedUnits: entity.estimatedUnits,
            movements: entity.movements
        };
    }

    /**
     * Converts an HTTP Axios response into an array of SmartContainer entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {SmartContainer[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || response.status !== 200) {
            console.error(response ? `Status: ${response.status}` : 'No response');
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data['smart-containers'] || [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
