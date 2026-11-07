/**
 * Command to release a SmartBox from its current ambulance (US08).
 *
 * @class UnlinkContainerCommand
 */
export class UnlinkContainerCommand {
    /**
     * @param {Object} params - Command parameters.
     * @param {string} params.containerId - SmartContainer identifier.
     */
    constructor({ containerId }) {
        if (!containerId) throw new Error('UnlinkContainerCommand: containerId is required.');
        this.containerId = containerId;
    }
}
