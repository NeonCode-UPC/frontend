/**
 * Command used to start a dispatched transport trip.
 *
 * @class StartDispatchedTripCommand
 */
export class StartDispatchedTripCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string|number} params.tripId - Dispatch trip identifier.
     */
    constructor({tripId}) {
        this.tripId = tripId;
    }
}