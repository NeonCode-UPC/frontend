/**
 * Command used to assign the required transport resources
 * to a dispatch trip.
 *
 * @class AssignVehicleAndBoxCommand
 */
export class AssignVehicleAndBoxCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string|number} params.tripId - Dispatch trip identifier.
     * @param {string|number} params.ambulanceId - Ambulance identifier.
     * @param {string|number} params.containerId - Medical container identifier.
     */
    constructor({
                    tripId,
                    ambulanceId,
                    containerId
                }) {
        this.tripId = tripId;
        this.ambulanceId = ambulanceId;
        this.containerId = containerId;
    }
}