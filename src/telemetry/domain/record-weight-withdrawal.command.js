/**
 * Command to record a weight withdrawal or deposit detected by the HX711 load cell (US11).
 *
 * @class RecordWeightWithdrawalCommand
 */
export class RecordWeightWithdrawalCommand {
    /**
     * @param {Object} params - Command parameters.
     * @param {string} params.containerId - SmartContainer identifier (e.g. 'SB-0182').
     * @param {number} params.weightDiff - Mass variation in kilograms (negative = withdrawal, e.g. -0.8).
     * @param {number} params.units - Estimated unit count difference (negative = withdrawal, e.g. -2).
     * @param {string} params.responsible - Medical personnel confirming the event.
     */
    constructor({ containerId, weightDiff, units, responsible }) {
        if (!containerId) throw new Error('RecordWeightWithdrawalCommand: containerId is required.');
        if (!responsible || !String(responsible).trim()) {
            throw new Error('RecordWeightWithdrawalCommand: responsible is required.');
        }
        this.containerId = containerId;
        this.weightDiff = Number(weightDiff);
        this.units = Number(units);
        this.responsible = String(responsible).trim();
    }
}
