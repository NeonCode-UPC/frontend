/**
 * Command used to recalculate the dynamic ETA
 * of a dispatch trip.
 *
 * @class UpdateDynamicEtaCommand
 */
export class UpdateDynamicEtaCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string|number} params.tripId - Dispatch trip identifier.
     * @param {number} params.eta - Updated estimated time of arrival in minutes.
     */
    constructor({
                    tripId,
                    eta
                }) {
        this.tripId = tripId;
        this.eta = eta;
    }
}