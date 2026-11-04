/**
 * SmartContainer aggregate root entity within the Smart Container & Telemetry Monitoring bounded context.
 * Aligned with Table 4 (`smart_containers`) of Chapter 4.8 Database Design and Chapter 4.7 Class Diagram.
 *
 * @class SmartContainer
 */
export class SmartContainer {
    /**
     * @param {Object} params - Entity attributes aligned with `smart_containers` database table and UI state.
     * @param {?string|number} [params.id=null] - Unique identifier (`id` UUIDv7 / business ID).
     * @param {string} [params.serialNumber=''] - Hardware chassis & firmware serial (`serial_number`, e.g. 'SMB-BOX-2026-0042').
     * @param {string} [params.formFactor='StandardBox_20L'] - Physical size (`form_factor`: 'SmallBox_5L' | 'StandardBox_20L').
     * @param {string} [params.containerStatus='Available'] - Domain lifecycle (`status`: 'Available' | 'Precooling' | 'LockedAndReady' | 'InTransit' | 'Delivered' | 'MaintenanceRequired').
     * @param {string} [params.lockState='Locked'] - Electromechanical lock state (`lock_state`: 'Locked' | 'Unlocked' | 'Tampered' | 'Error').
     * @param {number} [params.currentTemperatureCelsius=4.0] - Latest internal temperature in °C (`current_temperature_celsius`).
     * @param {number} [params.tareWeightGrams=10000.0] - Calibrated empty tare weight in grams (`tare_weight_grams`).
     * @param {number} [params.netWeightGrams=0.0] - Current net biological payload weight in grams (`net_weight_grams`).
     * @param {number} [params.batteryPercentage=100.0] - Internal LiFePO4 battery percentage (`battery_percentage`).
     * @param {boolean} [params.is12vConnected=false] - 12V ambulance auxiliary power connection flag (`is_12v_connected`).
     * @param {?string} [params.lastTelemetryAt=null] - UTC ISO timestamp of last ESP32 telemetry packet (`last_telemetry_at`).
     * @param {?string} [params.createdAt=null] - UTC ISO timestamp of container registration (`created_at`).
     * @param {?string} [params.updatedAt=null] - UTC ISO timestamp of last state update (`updated_at`).
     * @param {string} [params.model] - Human-readable model label derived from `formFactor`.
     * @param {?string} [params.ambulancePlate=null] - Assigned ambulance license plate from active dispatch trip.
     * @param {?string} [params.currentTransferId=null] - Linked active transport/dispatch identifier.
     * @param {number} [params.currentTemperature] - Alias for `currentTemperatureCelsius`.
     * @param {number} [params.targetMinTemperature=2.0] - Safe cold-chain minimum temperature (+2.0 °C).
     * @param {number} [params.targetMaxTemperature=8.0] - Safe cold-chain maximum temperature (+8.0 °C).
     * @param {number} [params.batteryLevel] - Alias for `batteryPercentage`.
     * @param {string} [params.lidStatus] - UI alias ('closed' | 'open') derived from `lockState`.
     * @param {number} [params.netWeight] - UI weight in kg derived from `netWeightGrams` / `tareWeightGrams`.
     * @param {number} [params.tareWeight] - UI tare weight in kg derived from `tareWeightGrams`.
     * @param {string} [params.signalQuality='Fuerte'] - IoT cellular signal indicator.
     * @param {string} [params.location='Base Clínica San Borja'] - Current GPS or base location label.
     * @param {string} [params.status='online'] - UI connectivity/operational status ('online' | 'warning' | 'offline' | 'unlinked').
     * @param {string} [params.lastPing='Reciente'] - Human-readable elapsed time since `lastTelemetryAt`.
     * @param {number} [params.unitWeight=0.4] - Estimated weight per medical vial in kg.
     * @param {number} [params.estimatedUnits=0] - Estimated number of vials based on net payload weight.
     * @param {Array<Object>} [params.movements=[]] - Registered payload movements.
     */
    constructor({
        id = null,
        serialNumber = '',
        formFactor = null,
        containerStatus = null,
        lockState = null,
        currentTemperatureCelsius = undefined,
        tareWeightGrams = undefined,
        netWeightGrams = undefined,
        batteryPercentage = undefined,
        is12vConnected = undefined,
        lastTelemetryAt = null,
        createdAt = null,
        updatedAt = null,
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
        const resolvedTemp = currentTemperatureCelsius ?? currentTemperature ?? 4.0;
        const resolvedBattery = batteryPercentage ?? batteryLevel ?? 100.0;
        const resolvedTareGrams = tareWeightGrams ?? (tareWeight !== undefined ? Number((tareWeight * 1000).toFixed(2)) : 10000.0);
        const resolvedNetGrams = netWeightGrams ?? (netWeight !== undefined
            ? Number((Math.max(0, netWeight - (resolvedTareGrams / 1000)) * 1000).toFixed(2))
            : 0.0);
        const resolvedFormFactor = formFactor || (String(model).includes('5L') ? 'SmallBox_5L' : 'StandardBox_20L');
        const resolvedLockState = lockState || (lidStatus === 'open' ? 'Unlocked' : 'Locked');
        const resolvedContainerStatus = containerStatus || SmartContainer.mapUiStatusToDomainStatus(status, ambulancePlate, currentTransferId);

        // Official Database Schema fields (`smart_containers` table - Chapter 4.8.1.2)
        this.id = id;
        this.serialNumber = serialNumber;
        this.formFactor = resolvedFormFactor;
        this.containerStatus = resolvedContainerStatus;
        this.lockState = resolvedLockState;
        this.currentTemperatureCelsius = Number(resolvedTemp);
        this.tareWeightGrams = Number(resolvedTareGrams);
        this.netWeightGrams = Number(resolvedNetGrams);
        this.batteryPercentage = Number(resolvedBattery);
        this.is12vConnected = is12vConnected ?? (status === 'online' && Boolean(ambulancePlate));
        this.lastTelemetryAt = lastTelemetryAt || new Date().toISOString();
        this.createdAt = createdAt || '2026-09-01T08:00:00.000000Z';
        this.updatedAt = updatedAt || this.lastTelemetryAt;

        // UI & presentation properties preserved for full view compatibility
        this.model = model || (resolvedFormFactor === 'SmallBox_5L' ? 'Compact Medical SmartBox 5L' : 'Standard Medical SmartBox 20L');
        this.ambulancePlate = ambulancePlate;
        this.currentTransferId = currentTransferId;
        this.currentTemperature = this.currentTemperatureCelsius;
        this.targetMinTemperature = targetMinTemperature;
        this.targetMaxTemperature = targetMaxTemperature;
        this.batteryLevel = Math.round(this.batteryPercentage);
        this.lidStatus = resolvedLockState === 'Locked' ? 'closed' : 'open';
        this.tareWeight = tareWeight !== undefined ? tareWeight : Number((this.tareWeightGrams / 1000).toFixed(2));
        this.netWeight = netWeight !== undefined ? netWeight : Number(((this.tareWeightGrams + this.netWeightGrams) / 1000).toFixed(2));
        this.signalQuality = signalQuality;
        this.location = location;
        this.status = status;
        this.lastPing = lastPing;
        this.unitWeight = unitWeight;
        this.estimatedUnits = estimatedUnits;
        this.movements = movements;
    }

    /**
     * Maps UI status and link state to the canonical `smart_containers.status` ENUM.
     */
    static mapUiStatusToDomainStatus(uiStatus, ambulancePlate, currentTransferId) {
        if (uiStatus === 'offline') return 'MaintenanceRequired';
        if (currentTransferId) return 'InTransit';
        if (ambulancePlate) return 'LockedAndReady';
        return 'Available';
    }

    /**
     * Checks if current temperature is within cold-chain safe preservation boundaries (+2.0 °C to +8.0 °C).
     * @returns {boolean}
     */
    get isTemperatureInSafeRange() {
        return this.currentTemperatureCelsius >= this.targetMinTemperature &&
               this.currentTemperatureCelsius <= this.targetMaxTemperature;
    }

    /**
     * Returns true if container is currently assigned to an active ambulance.
     * @returns {boolean}
     */
    get isLinked() {
        return Boolean(this.ambulancePlate);
    }
}
