/**
 * Dispatch trip aggregate root representation used by the
 * Medical Transport Planning & Dispatching bounded context.
 *
 * @class DispatchTrip
 */
export class DispatchTrip {
    /**
     * @param {Object} params - Dispatch trip attributes.
     * @param {string|number} params.id - Unique dispatch trip identifier.
     * @param {string|number} params.transportOrderId - Associated transport order identifier.
     * @param {string|number|null} [params.ambulanceId] - Assigned ambulance identifier.
     * @param {string} params.status - Current dispatch trip status.
     * @param {number|null} [params.eta] - Estimated time of arrival in minutes.
     * @param {string|null} [params.scheduledDepartureTime]
     * @param {string|null} [params.estimatedArrivalTime]
     * @param {number|null} [params.distanceKilometers]
     */
    constructor({
        id,
        transportOrderId,
        ambulanceId = null,
        status,
        eta = null,
        scheduledDepartureTime = null,
        estimatedArrivalTime = null,
        distanceKilometers = null
    } = {}) {
        this.id = id;
        this.transportOrderId = transportOrderId;
        this.ambulanceId = ambulanceId;
        this.status = status;
        this.eta = eta;
        this.scheduledDepartureTime = scheduledDepartureTime;
        this.estimatedArrivalTime = estimatedArrivalTime;
        this.distanceKilometers = distanceKilometers;
    }
}