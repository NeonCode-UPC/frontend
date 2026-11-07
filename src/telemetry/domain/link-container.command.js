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
     */
    constructor({ containerId, ambulancePlate }) {
        if (!containerId) throw new Error('LinkContainerCommand: containerId is required.');
        if (!ambulancePlate) throw new Error('LinkContainerCommand: ambulancePlate is required.');
        this.containerId = containerId;
        this.ambulancePlate = ambulancePlate;
    }
}
