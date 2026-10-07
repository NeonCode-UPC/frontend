/**
 * TelemetryLog entity within the Smart Container & Telemetry Monitoring bounded context.
 * Represents an immutable periodic snapshot of IoT telemetry emitted by a Smart Container.
 *
 * @class TelemetryLog
 */
export class TelemetryLog {
    /**
     * @param {Object} params - Telemetry reading attributes.
     * @param {?string} [params.id=null] - Unique telemetry log identifier.
     * @param {string} [params.containerId=''] - SmartContainer business identifier (e.g., 'SB-0182').
     * @param {?string} [params.transferId=null] - Linked transport order identifier (e.g., 'TR-0417').
     * @param {string} [params.timestamp=''] - Formatted date/time string.
     * @param {string} [params.time=''] - Time string (e.g., '13:40').
     * @param {number} [params.temperature=4.0] - Temperature reading in Celsius.
     * @param {number} [params.netWeight=18.4] - Gross measured weight in kg.
     * @param {number} [params.batteryLevel=82] - Auxiliary 12V / LiFePO4 battery percentage.
     * @param {string} [params.lidStatus='closed'] - Electromechanical seal state: 'closed' | 'open'.
     * @param {string} [params.status='normal'] - Telemetry severity state: 'normal' | 'warning' | 'critical'.
     */
    constructor({
        id = null,
        containerId = '',
        transferId = null,
        timestamp = '',
        time = '',
        temperature = 4.0,
        netWeight = 18.4,
        batteryLevel = 82,
        lidStatus = 'closed',
        status = 'normal'
    } = {}) {
        this.id = id;
        this.containerId = containerId;
        this.transferId = transferId;
        this.timestamp = timestamp;
        this.time = time;
        this.temperature = temperature;
        this.netWeight = netWeight;
        this.batteryLevel = batteryLevel;
        this.lidStatus = lidStatus;
        this.status = status;
    }
}
