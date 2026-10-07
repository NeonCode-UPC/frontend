/**
 * Command used to register the arrival of a dispatch trip
 * at its destination.
 *
 * @class RegisterDestinationArrivalCommand
 */
export class RegisterDestinationArrivalCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string|number} params.tripId - Dispatch trip identifier.
     */
    constructor({tripId}) {
        this.tripId = tripId;
    }
}