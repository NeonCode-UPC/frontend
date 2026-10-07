/**
 * Command used by the Transport application layer
 * to create a new transport order.
 *
 * @class CreateTransportOrderCommand
 */
export class CreateTransportOrderCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {Object} params.origin - Origin IPRESS and verified GPS geocell.
     * @param {Object} params.destination - Destination IPRESS and verified GPS geocell.
     * @param {number} params.maximumColdIschemiaTime - Maximum cold ischemia time.
     */
    constructor({
                    origin,
                    destination,
                    maximumColdIschemiaTime
                }) {
        this.origin = origin;
        this.destination = destination;
        this.maximumColdIschemiaTime = maximumColdIschemiaTime;
    }
}