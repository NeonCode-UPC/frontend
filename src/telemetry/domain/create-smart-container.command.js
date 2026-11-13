import { ThermalThresholds } from "./thermal-thresholds.value-object.js";

/**
 * Command to register a new SmartContainer unit in the cold-chain fleet inventory (US28).
 *
 * @class CreateSmartContainerCommand
 */
export class CreateSmartContainerCommand {
    static MAX_SERIAL_LENGTH = 30;
    static VALID_FORM_FACTORS = ['StandardBox_20L', 'SmallBox_5L'];

    /**
     * @param {Object} params
     * @param {string} params.serialNumber - Hardware serial identifier (e.g. 'SB-0182').
     * @param {string} [params.formFactor='StandardBox_20L'] - Physical capacity form factor.
     * @param {number} [params.tareWeightKg=10] - Calibrated empty tare weight in kilograms.
     * @param {number} [params.initialTemperature=4] - Initial internal chamber temperature in °C.
     * @param {number} [params.minTemp=2] - Lower safe thermal threshold in °C.
     * @param {number} [params.maxTemp=8] - Upper safe thermal threshold in °C.
     * @param {number} [params.warningTemp=7.5] - Preventive thermal warning limit in °C.
     * @param {number} [params.excursionToleranceSeconds=120] - Out-of-range tolerance before critical alert.
     */
    constructor({
        serialNumber,
        formFactor = 'StandardBox_20L',
        tareWeightKg = 10,
        initialTemperature = 4,
        minTemp = ThermalThresholds.DEFAULT_MIN_CELSIUS,
        maxTemp = ThermalThresholds.DEFAULT_MAX_CELSIUS,
        warningTemp = ThermalThresholds.DEFAULT_WARNING_CELSIUS,
        excursionToleranceSeconds = ThermalThresholds.DEFAULT_EXCURSION_TOLERANCE_SECONDS
    }) {
        const normalizedSerial = String(serialNumber ?? '').trim().toUpperCase();
        if (!normalizedSerial) {
            throw new Error('CreateSmartContainerCommand: serialNumber is required.');
        }
        if (normalizedSerial.length > CreateSmartContainerCommand.MAX_SERIAL_LENGTH) {
            throw new Error(`CreateSmartContainerCommand: serialNumber cannot exceed ${CreateSmartContainerCommand.MAX_SERIAL_LENGTH} characters.`);
        }

        const resolvedFormFactor = CreateSmartContainerCommand.VALID_FORM_FACTORS.includes(formFactor)
            ? formFactor
            : 'StandardBox_20L';

        const tareGrams = Math.round(Number(tareWeightKg) * 1000);
        if (!Number.isFinite(tareGrams) || tareGrams < 0) {
            throw new Error('CreateSmartContainerCommand: tareWeightKg must be zero or positive.');
        }

        const resolvedTemp = Number(initialTemperature);
        if (!Number.isFinite(resolvedTemp)) {
            throw new Error('CreateSmartContainerCommand: initialTemperature must be a valid number.');
        }

        const tolerance = Math.round(Number(excursionToleranceSeconds));
        if (!Number.isFinite(tolerance) || tolerance <= 0) {
            throw new Error('CreateSmartContainerCommand: excursionToleranceSeconds must be positive.');
        }

        this.serialNumber = normalizedSerial;
        this.formFactor = resolvedFormFactor;
        this.tareWeightGrams = tareGrams;
        this.initialTemperature = resolvedTemp;
        this.thresholds = new ThermalThresholds({
            minCelsius: minTemp,
            maxCelsius: maxTemp,
            warningCelsius: warningTemp,
            excursionToleranceSeconds: tolerance
        });
    }
}
