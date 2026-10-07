/**
 * Infrastructure resource representing a dispatch trip.
 *
 * @class DispatchTripResource
 */
export class DispatchTripResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Dispatch trip identifier.
     * @param {string|number} params.transportOrderId - Associated transport order identifier.
     * @param {string|number|null} params.ambulanceId - Assigned ambulance identifier.
     * @param {string} params.status - Dispatch trip status.
     * @param {number|null} params.eta - Estimated time of arrival in minutes.
     */
    constructor({
                    id,
                    transportOrderId,
                    ambulanceId = null,
                    status,
                    eta = null
                }) {
        this.id = id;
        this.transportOrderId = transportOrderId;
        this.ambulanceId = ambulanceId;
        this.status = status;
        this.eta = eta;
    }
}