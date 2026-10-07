/**
 * Infrastructure resource payload for a TelemetryLog record returned by the API.
 *
 * @class TelemetryLogResource
 */
export class TelemetryLogResource {
    /**
     * @param {Object} params
     * @param {string} params.id
     * @param {string} params.containerId
     * @param {?string} [params.transferId]
     * @param {string} params.timestamp
     * @param {string} [params.time]
     * @param {number} params.temperature
     * @param {number} params.netWeight
     * @param {number} params.batteryLevel
     * @param {string} params.lidStatus
     * @param {string} [params.status]
     */
    constructor({
        id,
        containerId,
        transferId,
        timestamp,
        time,
        temperature,
        netWeight,
        batteryLevel,
        lidStatus,
        status
    }) {
        this.id = id;
        this.containerId = containerId;
        this.transferId = transferId;
        this.timestamp = timestamp;
        this.time = time || (timestamp ? timestamp.split(' ')[1] : '');
        this.temperature = temperature;
        this.netWeight = netWeight;
        this.batteryLevel = batteryLevel;
        this.lidStatus = lidStatus;
        this.status = status || 'normal';
    }
}
