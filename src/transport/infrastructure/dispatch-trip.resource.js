/**
 * Infrastructure resource representing a dispatch trip received from the transport service.
 *
 * @class DispatchTripResource
 */
export class DispatchTripResource {
    /**
     * @param {Object} [params] - Resource payload.
     * @param {string|number} [params.id]
     * @param {string|number} [params.transportOrderId]
     * @param {string|number} [params.orderId]
     * @param {string|null} [params.ambulanceId]
     * @param {string|null} [params.assignedVehiclePlate]
     * @param {string} [params.status]
     * @param {number|null} [params.eta]
     * @param {number|null} [params.plannedDurationMinutes]
     * @param {string|null} [params.scheduledDepartureTime]
     * @param {string|null} [params.estimatedArrivalTime]
     * @param {number|null} [params.distanceKilometers]
     */
    constructor({
        id,
        transportOrderId,
        orderId,
        ambulanceId = null,
        assignedVehiclePlate = null,
        status,
        eta = null,
        plannedDurationMinutes = null,
        scheduledDepartureTime = null,
        estimatedArrivalTime = null,
        distanceKilometers = null
    } = {}) {
        this.id = id;
        this.transportOrderId = transportOrderId ?? orderId ?? null;
        this.ambulanceId = ambulanceId ?? assignedVehiclePlate ?? null;
        this.status = this.#mapStatus(status);
        this.eta = eta ?? plannedDurationMinutes ?? null;
        this.scheduledDepartureTime = scheduledDepartureTime;
        this.estimatedArrivalTime = estimatedArrivalTime;
        this.distanceKilometers = distanceKilometers;
    }

    #mapStatus(rawStatus) {
        if (!rawStatus) return 'Pending';
        const s = String(rawStatus).toLowerCase();
        if (s.includes('assigned')) return 'Assigned';
        if (s.includes('route') || s.includes('arrived') || s.includes('intransit')) return 'InTransit';
        if (s.includes('complete')) return 'Completed';
        if (s.includes('cancel')) return 'Cancelled';
        return rawStatus;
    }
}