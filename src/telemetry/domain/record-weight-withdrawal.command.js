/**
 * Command to record a weight withdrawal or deposit detected by HX711 load cell (US11).
 *
 * @class RecordWeightWithdrawalCommand
 */
export class RecordWeightWithdrawalCommand {
    /**
     * @param {Object} params - Command parameters.
     * @param {string} params.containerId - SmartContainer identifier (e.g. 'SB-0182').
     * @param {number} params.weightDiff - Mass variation in kilograms (e.g. -0.8).
     * @param {number} params.units - Estimated unit count difference (e.g. -2).
     * @param {string} params.responsible - Medical personnel confirming the event.
     */
    constructor({ containerId, weightDiff, units, responsible }) {
        this.containerId = containerId;
        this.weightDiff = weightDiff;
        this.units = units;
        this.responsible = responsible;
    }
}
