/**
 * Infrastructure resource representing a transport order received
 * from the transport service.
 *
 * @class TransportOrderResource
 */
export class TransportOrderResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Transport order identifier.
     * @param {Object} params.origin - Origin IPRESS and verified GPS geocell.
     * @param {Object} params.destination - Destination IPRESS and verified GPS geocell.
     * @param {number} params.maximumColdIschemiaTime - Maximum cold ischemia time.
     * @param {string} params.status - Transport order status.
     */
    constructor({
                    id,
                    origin,
                    destination,
                    maximumColdIschemiaTime,
                    status
                }) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.maximumColdIschemiaTime = maximumColdIschemiaTime;
        this.status = status;
    }
}