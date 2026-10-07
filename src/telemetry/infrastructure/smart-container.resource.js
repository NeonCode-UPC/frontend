/**
 * Infrastructure resource payload for a SmartContainer returned by the REST API or json-server.
 *
 * @class SmartContainerResource
 */
export class SmartContainerResource {
    /**
     * @param {Object} params - Raw API payload attributes.
     * @param {string} params.id
     * @param {string} params.serialNumber
     * @param {string} [params.model]
     * @param {?string} [params.ambulancePlate]
     * @param {?string} [params.currentTransferId]
     * @param {number} params.currentTemperature
     * @param {number} [params.targetMinTemperature]
     * @param {number} [params.targetMaxTemperature]
     * @param {number} params.batteryLevel
     * @param {string} params.lidStatus
     * @param {number} params.netWeight
     * @param {number} [params.tareWeight]
     * @param {string} [params.signalQuality]
     * @param {string} [params.location]
     * @param {string} params.status
     * @param {string} [params.lastPing]
     * @param {number} [params.unitWeight]
     * @param {number} [params.estimatedUnits]
     * @param {Array<Object>} [params.movements]
     */
    constructor({
        id,
        serialNumber,
        model,
        ambulancePlate,
        currentTransferId,
        currentTemperature,
        targetMinTemperature,
        targetMaxTemperature,
        batteryLevel,
        lidStatus,
        netWeight,
        tareWeight,
        signalQuality,
        location,
        status,
        lastPing,
        unitWeight,
        estimatedUnits,
        movements
    }) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.model = model;
        this.ambulancePlate = ambulancePlate;
        this.currentTransferId = currentTransferId;
        this.currentTemperature = currentTemperature;
        this.targetMinTemperature = targetMinTemperature;
        this.targetMaxTemperature = targetMaxTemperature;
        this.batteryLevel = batteryLevel;
        this.lidStatus = lidStatus;
        this.netWeight = netWeight;
        this.tareWeight = tareWeight;
        this.signalQuality = signalQuality;
        this.location = location;
        this.status = status;
        this.lastPing = lastPing;
        this.unitWeight = unitWeight;
        this.estimatedUnits = estimatedUnits;
        this.movements = movements || [];
    }
}
