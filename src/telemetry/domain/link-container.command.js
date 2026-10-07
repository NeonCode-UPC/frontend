/**
 * Command to link a SmartBox IoT device to an available ambulance vehicle (US08).
 *
 * @class LinkContainerCommand
 */
export class LinkContainerCommand {
    /**
     * @param {Object} params - Command parameters.
     * @param {string} params.containerId - SmartContainer identifier (e.g. 'SB-0165').
     * @param {string} params.ambulancePlate - Ambulance vehicle plate (e.g. 'AUC-215').
     * @param {string} [params.responsible='Luis Quispe'] - Healthcare operator responsible.
     */
    constructor({ containerId, ambulancePlate, responsible = 'Luis Quispe' }) {
        this.containerId = containerId;
        this.ambulancePlate = ambulancePlate;
        this.responsible = responsible;
    }
}
