import { ThermalThresholds } from "./thermal-thresholds.value-object.js";
import { TelemetryLog } from "./telemetry-log.entity.js";

/**
 * SmartContainer aggregate root entity within the Smart Container & Telemetry Monitoring bounded context.
 * Aligned with Table 4 (`smart_containers`) of Chapter 4.8 Database Design and Chapter 4.7 Class Diagram.
 *
 * @class SmartContainer
 */
export class SmartContainer {
    /**
     * @param {Object} params - Entity attributes aligned with `smart_containers` database table and UI state.
     * @param {?string|number} [params.id=null] - Unique identifier (`id` UUIDv7 / monotonic integer / business ID).
     * @param {string} [params.serialNumber=''] - Hardware chassis & firmware serial (`serial_number`, e.g. 'SB-0182').
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
     * @param {number} [params.warningTemperature=7.5] - Preventive warning limit in °C (D-06).
     * @param {number} [params.batteryWarningPercentage=20] - Battery percentage that triggers a warning.
     * @param {string} [params.signalQuality='strong'] - IoT cellular signal code ('strong' | 'medium' | 'weak' | 'none').
     * @param {string} [params.location=''] - Current GPS or base location label.
     * @param {string} [params.status='online'] - UI connectivity/operational status ('online' | 'warning' | 'offline' | 'unlinked').
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
        targetMinTemperature = ThermalThresholds.DEFAULT_MIN_CELSIUS,
        targetMaxTemperature = ThermalThresholds.DEFAULT_MAX_CELSIUS,
        warningTemperature = ThermalThresholds.DEFAULT_WARNING_CELSIUS,
        excursionToleranceSeconds = ThermalThresholds.DEFAULT_EXCURSION_TOLERANCE_SECONDS,
        batteryWarningPercentage = 20,
        batteryLevel = 100,
        lidStatus = 'closed',
        netWeight = 0.0,
        tareWeight = 10.0,
        signalQuality = 'strong',
        location = '',
        status = 'online',
        unitWeight = 0.4,
        estimatedUnits = undefined,
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
        const resolvedDomainStatus = containerStatus || SmartContainer.mapUiStatusToDomainStatus(status, ambulancePlate, currentTransferId);
        const resolvedUiStatus = ['online', 'warning', 'offline', 'unlinked'].includes(status)
            ? status
            : SmartContainer.mapDomainStatusToUiStatus(resolvedDomainStatus, ambulancePlate);
        const resolvedEstimatedUnits = (estimatedUnits !== undefined && estimatedUnits !== null)
            ? Number(estimatedUnits)
            : (resolvedNetGrams > 0 && unitWeight > 0 ? Math.round((resolvedNetGrams / 1000) / unitWeight) : 0);

        // Official Database Schema fields (`smart_containers` table - Chapter 4.8.1.2)
        this.id = id;
        this.serialNumber = serialNumber || (typeof id === 'string' && id.startsWith('SB-') ? id : '');
        this.displayCode = SmartContainer.resolveDisplayCode(this.id, this.serialNumber);
        this.formFactor = resolvedFormFactor;
        this.containerStatus = resolvedDomainStatus;
        this.lockState = resolvedLockState;
        this.currentTemperatureCelsius = Number(resolvedTemp);
        this.tareWeightGrams = Number(resolvedTareGrams);
        this.netWeightGrams = Number(resolvedNetGrams);
        this.batteryPercentage = Number(resolvedBattery);
        this.is12vConnected = is12vConnected ?? (resolvedUiStatus === 'online' && Boolean(ambulancePlate));
        this.lastTelemetryAt = lastTelemetryAt || TelemetryLog.currentTimestamp();
        this.createdAt = createdAt || '2026-09-01T08:00:00.000000Z';
        this.updatedAt = updatedAt || this.lastTelemetryAt;

        // UI & presentation properties preserved for full view compatibility
        this.model = model || (resolvedFormFactor === 'SmallBox_5L' ? 'Compact Medical SmartBox 5L' : 'Standard Medical SmartBox 20L');
        this.ambulancePlate = ambulancePlate;
        this.currentTransferId = currentTransferId;
        this.currentTemperature = this.currentTemperatureCelsius;
        this.targetMinTemperature = targetMinTemperature;
        this.targetMaxTemperature = targetMaxTemperature;
        this.warningTemperature = warningTemperature;
        this.excursionToleranceSeconds = Number(excursionToleranceSeconds);
        this.batteryWarningPercentage = batteryWarningPercentage;
        this.batteryLevel = Math.round(this.batteryPercentage);
        this.lidStatus = resolvedLockState === 'Locked' ? 'closed' : 'open';
        this.tareWeight = tareWeight !== undefined ? tareWeight : Number((this.tareWeightGrams / 1000).toFixed(2));
        this.netWeight = netWeight !== undefined ? netWeight : Number(((this.tareWeightGrams + this.netWeightGrams) / 1000).toFixed(2));
        this.signalQuality = SmartContainer.normalizeSignalQuality(signalQuality);
        this.location = location;
        this.status = resolvedUiStatus;
        this.unitWeight = unitWeight;
        this.estimatedUnits = resolvedEstimatedUnits;
        this.movements = movements;
    }

    /**
     * Maps canonical backend / database `containerStatus` ENUM to UI status code.
     * @param {string} domainStatus
     * @param {?string} ambulancePlate
     * @returns {'online'|'warning'|'offline'|'unlinked'}
     */
    static mapDomainStatusToUiStatus(domainStatus, ambulancePlate) {
        if (!domainStatus) return ambulancePlate ? 'online' : 'unlinked';
        const s = String(domainStatus).toLowerCase();
        if (s.includes('maintenance') || s.includes('offline')) return 'offline';
        if (s.includes('available') || (!ambulancePlate && s !== 'intransit')) return 'unlinked';
        return 'online';
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
     * Normalizes legacy signal labels into stable codes that the UI translates.
     * @param {string} value
     * @returns {'strong'|'medium'|'weak'|'none'}
     */
    static normalizeSignalQuality(value) {
        const legacy = { 'Fuerte': 'strong', 'Media': 'medium', 'Débil': 'weak', 'Sin señal': 'none' };
        const code = legacy[value] || value;
        return ['strong', 'medium', 'weak', 'none'].includes(code) ? code : 'none';
    }

    /**
     * Thermal thresholds configured for this container (D-06).
     * @returns {ThermalThresholds}
     */
    get thermalThresholds() {
        return new ThermalThresholds({
            minCelsius: this.targetMinTemperature,
            maxCelsius: this.targetMaxTemperature,
            warningCelsius: this.warningTemperature,
            excursionToleranceSeconds: this.excursionToleranceSeconds
        });
    }

    /**
     * Resolves human-readable SmartBox code shown in UI and referenced by TelemetryLog.containerId.
     * The .NET API returns numeric `id` + `serialNumber` (e.g. 'SB-0182'), whereas mock db.json puts 'SB-0182' in `id`.
     * @param {?string|number} id
     * @param {?string} serialNumber
     * @returns {string}
     */
    static resolveDisplayCode(id, serialNumber) {
        if (typeof id === 'number' && serialNumber) {
            return String(serialNumber);
        }
        if (serialNumber && /^SB-/i.test(String(serialNumber))) {
            return String(serialNumber);
        }
        return id !== null && id !== undefined ? String(id) : String(serialNumber || '');
    }

    /**
     * Checks whether this container matches a route query, API id, or serial number.
     * @param {?string|number} identifier
     * @returns {boolean}
     */
    matchesIdentifier(identifier) {
        if (identifier === null || identifier === undefined || identifier === '') return false;
        const normalized = String(identifier).trim().toLowerCase();
        if (this.id !== null && this.id !== undefined && String(this.id).trim().toLowerCase() === normalized) return true;
        if (this.serialNumber && String(this.serialNumber).trim().toLowerCase() === normalized) return true;
        return false;
    }

    /**
     * Matches a TelemetryLog record or identifier against this container (`serialNumber` in .NET or `id` in mock data).
     * @param {Object|string|number} logOrRef
     * @returns {boolean}
     */
    ownsTelemetryLog(logOrRef) {
        const ref = typeof logOrRef === 'object' && logOrRef !== null ? logOrRef.containerId : logOrRef;
        return this.matchesIdentifier(ref);
    }

    /**
     * Thermal state of the latest reading.
     * @returns {'normal'|'warning'|'critical'}
     */
    get thermalState() {
        return this.thermalThresholds.classify(this.currentTemperatureCelsius);
    }

    /**
     * Checks if current temperature is within the configured cold-chain safe range.
     * @returns {boolean}
     */
    get isTemperatureInSafeRange() {
        return this.thermalThresholds.isInRange(this.currentTemperatureCelsius);
    }

    /**
     * Returns a copy of this container with another temperature reading.
     * Used by the live view to simulate a thermal excursion without hardware.
     * @param {number} celsius
     * @returns {SmartContainer}
     */
    withTemperature(celsius) {
        return new SmartContainer({ ...this, currentTemperatureCelsius: celsius, currentTemperature: celsius });
    }

    /**
     * Returns true if container is currently assigned to an active ambulance.
     * @returns {boolean}
     */
    get isLinked() {
        return Boolean(this.ambulancePlate);
    }
}
