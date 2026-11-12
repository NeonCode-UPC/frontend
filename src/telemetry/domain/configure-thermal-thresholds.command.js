import { ThermalThresholds } from "./thermal-thresholds.value-object.js";

/**
 * Command to configure the preservation thresholds and alerts of a SmartBox (US13).
 *
 * @class ConfigureThermalThresholdsCommand
 */
export class ConfigureThermalThresholdsCommand {
    /**
     * @param {Object} params - Command parameters.
     * @param {string} params.containerId - SmartContainer identifier.
     * @param {number} params.minTemp - Lower safe limit in °C.
     * @param {number} params.maxTemp - Upper safe limit in °C.
     * @param {number} params.warningTemp - Preventive warning limit in °C.
     * @param {number} params.batteryWarning - Battery percentage that triggers a warning.
     */
    constructor({ containerId, minTemp, maxTemp, warningTemp, batteryWarning }) {
        if (!containerId) throw new Error('ConfigureThermalThresholdsCommand: containerId is required.');
        // Validates the business rule (min < warning <= max) before reaching the store.
        this.thresholds = new ThermalThresholds({
            minCelsius: minTemp,
            maxCelsius: maxTemp,
            warningCelsius: warningTemp
        });
        this.containerId = containerId;
        this.batteryWarning = Number(batteryWarning);
    }
}
