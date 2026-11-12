/**
 * Value object that holds the cold-chain thermal thresholds of a SmartContainer
 * within the Smart Container & Telemetry Monitoring bounded context.
 *
 * Business rule (single source of truth for the whole BC):
 * - Safe range: from +2.0 °C to +8.0 °C.
 * - Preventive warning: temperature greater than or equal to +7.5 °C while still in range.
 * - Critical thermal excursion: temperature above +8.0 °C or below +2.0 °C for more than 120 seconds.
 *
 * @class ThermalThresholds
 */
export class ThermalThresholds {
    static DEFAULT_MIN_CELSIUS = 2.0;
    static DEFAULT_MAX_CELSIUS = 8.0;
    static DEFAULT_WARNING_CELSIUS = 7.5;
    static DEFAULT_EXCURSION_TOLERANCE_SECONDS = 120;

    /**
     * @param {Object} params
     * @param {number} [params.minCelsius=2.0] - Lower safe limit.
     * @param {number} [params.maxCelsius=8.0] - Upper safe limit.
     * @param {number} [params.warningCelsius=7.5] - Preventive warning limit.
     * @param {number} [params.excursionToleranceSeconds=120] - Time outside the range before the excursion is critical.
     */
    constructor({
        minCelsius = ThermalThresholds.DEFAULT_MIN_CELSIUS,
        maxCelsius = ThermalThresholds.DEFAULT_MAX_CELSIUS,
        warningCelsius = ThermalThresholds.DEFAULT_WARNING_CELSIUS,
        excursionToleranceSeconds = ThermalThresholds.DEFAULT_EXCURSION_TOLERANCE_SECONDS
    } = {}) {
        const min = Number(minCelsius);
        const max = Number(maxCelsius);
        const warning = Number(warningCelsius);
        if (!(min < max)) throw new Error('ThermalThresholds: minCelsius must be lower than maxCelsius.');
        if (warning < min || warning > max) throw new Error('ThermalThresholds: warningCelsius must be inside the safe range.');

        this.minCelsius = min;
        this.maxCelsius = max;
        this.warningCelsius = warning;
        this.excursionToleranceSeconds = Number(excursionToleranceSeconds);
        Object.freeze(this);
    }

    /**
     * @param {number} temperatureCelsius
     * @returns {boolean} True when the reading is inside the safe range.
     */
    isInRange(temperatureCelsius) {
        return temperatureCelsius >= this.minCelsius && temperatureCelsius <= this.maxCelsius;
    }

    /**
     * Classifies a reading.
     * When the time outside the range is unknown, an out-of-range reading is treated as critical.
     *
     * @param {number} temperatureCelsius
     * @param {?number} [secondsOutOfRange=null]
     * @returns {'normal'|'warning'|'critical'}
     */
    classify(temperatureCelsius, secondsOutOfRange = null) {
        if (!this.isInRange(temperatureCelsius)) {
            const exceeded = secondsOutOfRange === null || secondsOutOfRange > this.excursionToleranceSeconds;
            return exceeded ? 'critical' : 'warning';
        }
        return temperatureCelsius >= this.warningCelsius ? 'warning' : 'normal';
    }
}
