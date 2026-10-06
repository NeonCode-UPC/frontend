/**
 * Transport order aggregate root representation used by the
 * Medical Transport Planning & Dispatching bounded context.
 *
 * @class TransportOrder
 */
export class TransportOrder {
    /**
     * @param {Object} params - Transport order attributes.
     * @param {string|number} params.id - Unique transport order identifier.
     * @param {Object} params.origin - Origin IPRESS and verified GPS geocell.
     * @param {Object} params.destination - Destination IPRESS and verified GPS geocell.
     * @param {number} params.maximumColdIschemiaTime - Maximum cold ischemia time.
     * @param {string} params.status - Current transport order status.
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