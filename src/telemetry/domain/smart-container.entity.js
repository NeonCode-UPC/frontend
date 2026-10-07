/**
 * SmartContainer entity within the Smart Container & Telemetry Monitoring bounded context.
 * Represents an IoT smart medical container installed in an ambulance or stored in inventory.
 *
 * @class SmartContainer
 */
export class SmartContainer {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - SmartBox unique business identifier (e.g., 'SB-0182').
     * @param {string} [params.serialNumber=''] - Hardware identifier / MAC address.
     * @param {string} [params.model='Standard Medical SmartBox 20L'] - Container model name.
     * @param {?string} [params.ambulancePlate=null] - Linked ambulance license plate.
     * @param {?string} [params.currentTransferId=null] - Linked active transport order.
     * @param {number} [params.currentTemperature=4.0] - Last recorded temperature in Celsius.
     * @param {number} [params.targetMinTemperature=2.0] - Safe range minimum temperature.
     * @param {number} [params.targetMaxTemperature=8.0] - Safe range maximum temperature.
     * @param {number} [params.batteryLevel=100] - LiFePO4 battery percentage (0-100).
     * @param {string} [params.lidStatus='closed'] - State of the lid: 'closed' | 'open'.
     * @param {number} [params.netWeight=0.0] - Current gross weight in kg measured by HX711.
     * @param {number} [params.tareWeight=10.0] - Empty container tare weight in kg.
     * @param {string} [params.signalQuality='Fuerte'] - IoT signal strength.
     * @param {string} [params.location='Base Clínica San Borja'] - Current GPS or base location.
     * @param {string} [params.status='online'] - Operational status: 'online' | 'warning' | 'offline' | 'unlinked'.
     * @param {string} [params.lastPing='Reciente'] - Human-readable time since last telemetry reading.
     * @param {number} [params.unitWeight=0.4] - Estimated weight per medical vial in kg.
     * @param {number} [params.estimatedUnits=0] - Estimated number of vials based on weight.
     * @param {Array<Object>} [params.movements=[]] - List of registered stock movements.
     */
    constructor({
        id = null,
        serialNumber = '',
        model = 'Standard Medical SmartBox 20L',
        ambulancePlate = null,
        currentTransferId = null,
        currentTemperature = 4.0,
        targetMinTemperature = 2.0,
        targetMaxTemperature = 8.0,
        batteryLevel = 100,
        lidStatus = 'closed',
        netWeight = 0.0,
        tareWeight = 10.0,
        signalQuality = 'Fuerte',
        location = 'Base Clínica San Borja',
        status = 'online',
        lastPing = 'Reciente',
        unitWeight = 0.4,
        estimatedUnits = 0,
        movements = []
    } = {}) {
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
        this.movements = movements;
    }

    /**
     * Checks if current temperature is within cold chain safe preservation boundaries.
     * @returns {boolean}
     */
    get isTemperatureInSafeRange() {
        return this.currentTemperature >= this.targetMinTemperature &&
               this.currentTemperature <= this.targetMaxTemperature;
    }

    /**
     * Returns true if container is currently assigned to an active ambulance.
     * @returns {boolean}
     */
    get isLinked() {
        return Boolean(this.ambulancePlate);
    }
}
