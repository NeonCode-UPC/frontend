import {TransportOrder} from "../domain/transport-order.entity.js";
import {TransportOrderResource} from "./transport-order.resource.js";

/**
 * Maps transport infrastructure resources into domain entities.
 *
 * @class TransportOrderAssembler
 */
export class TransportOrderAssembler {
    /**
     * Converts a resource into a TransportOrder entity.
     *
     * @param {TransportOrderResource} resource - Transport order resource.
     * @returns {TransportOrder} Transport order entity.
     */
    static toEntityFromResource(resource) {
        return new TransportOrder({...resource});
    }

    /**
     * Converts an HTTP response into transport order entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {TransportOrder[]} Transport order entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response.data?.value)
                ? response.data.value
                : (response.data?.transportOrders || []));

        return resources.map(resource =>
            this.toEntityFromResource(new TransportOrderResource(resource))
        );
    }
}