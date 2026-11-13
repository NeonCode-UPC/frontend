import { ThermalThresholds } from "./thermal-thresholds.value-object.js";

/**
 * TelemetryLog entity within the Smart Container & Telemetry Monitoring bounded context.
 * Aligned with Table 5 (`telemetry_logs`) of Chapter 4.8 Database Design and Chapter 4.7 Class Diagram.
 *
 * @class TelemetryLog
 */
export class TelemetryLog {
    /**
     * @param {Object} params - Telemetry reading attributes aligned with `telemetry_logs` table.
     * @param {?string|number} [params.id=null] - Monotonic telemetry log identifier (`id`).
     * @param {string} [params.containerId=''] - SmartContainer emitter identifier (`container_id`).
     * @param {?string} [params.tripId=null] - Active ambulance dispatch trip identifier (`trip_id`).
     * @param {?string} [params.timestampUtc=null] - UTC timestamp provided by ESP32 RTC (`timestamp_utc`).
     * @param {number} [params.temperatureCelsius] - Internal biological chamber temperature in °C (`temperature_celsius`).
     * @param {number} [params.ambientTemperatureCelsius=22.5] - Ambulance cabin ambient temperature in °C (`ambient_temperature_celsius`).
     * @param {number} [params.weightGrams] - Gross weight in grams measured by HX711 (`weight_grams`).
     * @param {number} [params.batteryPercentage] - Internal LiFePO4 battery percentage (`battery_percentage`).
     * @param {boolean} [params.is12vConnected=true] - 12V ambulance auxiliary power circuit state (`is_12v_connected`).
     * @param {number} [params.peltierPowerPct=65] - PWM power percentage applied to Peltier cells (`peltier_power_pct`).
     * @param {boolean} [params.lidLockEngaged] - Magnetic lid contact verification (`lid_lock_engaged`: true=sealed, false=open).
     * @param {?number} [params.latitude=-12.0931] - GPS latitude coordinate from SIM7600G (`latitude`).
     * @param {?number} [params.longitude=-77.0024] - GPS longitude coordinate from SIM7600G (`longitude`).
     * @param {string} [params.firmwareSignature=''] - ESP32 cryptographic frame hash (`firmware_signature`).
     * @param {boolean} [params.isThermalExcursion] - Thermal excursion flag outside +2.0 °C to +8.0 °C (`is_thermal_excursion`).
     * @param {?string} [params.transferId=null] - UI alias for `tripId`.
     * @param {string} [params.timestamp=''] - Formatted date/time string for UI tables.
     * @param {string} [params.time=''] - Time string (e.g., '13:40') for UI charts.
     * @param {number} [params.temperature=4.0] - UI alias for `temperatureCelsius`.
     * @param {number} [params.netWeight=18.4] - UI weight in kg derived from `weightGrams`.
     * @param {number} [params.batteryLevel=82] - UI alias for `batteryPercentage`.
     * @param {string} [params.lidStatus='closed'] - UI alias ('closed' | 'open') derived from `lidLockEngaged`.
     * @param {string} [params.status='normal'] - UI severity state ('normal' | 'warning' | 'critical').
     */
    constructor({
        id = null,
        containerId = '',
        tripId = undefined,
        timestampUtc = null,
        temperatureCelsius = undefined,
        ambientTemperatureCelsius = 22.5,
        weightGrams = undefined,
        batteryPercentage = undefined,
        is12vConnected = true,
        peltierPowerPct = 65,
        lidLockEngaged = undefined,
        latitude = -12.0931,
        longitude = -77.0024,
        firmwareSignature = '',
        isThermalExcursion = undefined,
        transferId = null,
        timestamp = '',
        time = '',
        temperature = 4.0,
        netWeight = 18.4,
        batteryLevel = 82,
        lidStatus = 'closed',
        status = undefined
    } = {}) {
        const resolvedTemp = temperatureCelsius ?? temperature ?? 4.0;
        const resolvedWeightGrams = weightGrams ?? Number((netWeight * 1000).toFixed(2));
        const resolvedBattery = batteryPercentage ?? batteryLevel ?? 82.0;
        const resolvedLidEngaged = lidLockEngaged !== undefined ? Boolean(lidLockEngaged) : (lidStatus !== 'open');
        const resolvedExcursion = isThermalExcursion !== undefined
            ? Boolean(isThermalExcursion)
            : !new ThermalThresholds().isInRange(resolvedTemp);
        const resolvedTripId = tripId !== undefined ? tripId : transferId;

        // Official Database Schema fields (`telemetry_logs` table - Chapter 4.8.1.2)
        this.id = id;
        this.containerId = containerId;
        this.tripId = resolvedTripId;
        this.timestampUtc = timestampUtc || TelemetryLog.buildIsoTimestamp(timestamp, time);
        this.temperatureCelsius = Number(resolvedTemp);
        this.ambientTemperatureCelsius = Number(ambientTemperatureCelsius);
        this.weightGrams = Number(resolvedWeightGrams);
        this.batteryPercentage = Number(resolvedBattery);
        this.is12vConnected = Boolean(is12vConnected);
        this.peltierPowerPct = Number(peltierPowerPct);
        this.lidLockEngaged = resolvedLidEngaged;
        this.latitude = latitude !== null && latitude !== undefined ? Number(latitude) : null;
        this.longitude = longitude !== null && longitude !== undefined ? Number(longitude) : null;
        this.firmwareSignature = firmwareSignature || `ESP32-SHA256-${String(id || '0000').replace(/[^A-Z0-9]/gi, '')}`;
        this.isThermalExcursion = resolvedExcursion;

        // UI & chart compatibility fields
        this.transferId = this.tripId;
        this.temperature = this.temperatureCelsius;
        this.netWeight = netWeight !== undefined ? Number(netWeight) : Number((this.weightGrams / 1000).toFixed(2));
        this.batteryLevel = Math.round(this.batteryPercentage);
        this.lidStatus = this.lidLockEngaged ? 'closed' : 'open';
        this.time = time || TelemetryLog.extractTimeLabel(this.timestampUtc);
        this.timestamp = timestamp || TelemetryLog.formatDisplayTimestamp(this.timestampUtc, this.time);
        this.status = status || (this.isThermalExcursion ? 'critical' : (!this.lidLockEngaged ? 'warning' : 'normal'));
    }

    /**
     * Current time in the format used by the mock API: Lima wall-clock time written as an ISO string.
     * Every view of this BC reads timestamps as wall-clock time, so new readings line up with the mock data.
     * @returns {string}
     */
    static currentTimestamp() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.000000Z`;
    }

    static buildIsoTimestamp(timestamp, time) {
        if (timestamp && timestamp.includes('/')) {
            const [datePart, timePart] = timestamp.split(' ');
            const [day, month, year] = datePart.split('/');
            return `${year}-${month}-${day}T${timePart || time || '12:00'}:00.000000Z`;
        }
        return TelemetryLog.currentTimestamp();
    }

    static extractTimeLabel(isoString) {
        if (!isoString) return '';
        const match = String(isoString).match(/T(\d{2}:\d{2})/);
        return match ? match[1] : '';
    }

    static formatDisplayTimestamp(isoString, fallbackTime) {
        if (!isoString) return fallbackTime || '';
        const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
        if (match) {
            return `${match[3]}/${match[2]}/${match[1]} ${match[4]}`;
        }
        return String(isoString);
    }
}
