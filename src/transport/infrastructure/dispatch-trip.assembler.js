import {DispatchTrip} from "../domain/dispatch-trip.entity.js";
import {DispatchTripResource} from "./dispatch-trip.resource.js";

/**
 * Maps dispatch trip infrastructure resources into domain entities.
 *
 * @class DispatchTripAssembler
 */
export class DispatchTripAssembler {
    /**
     * Converts a resource into a DispatchTrip entity.
     *
     * @param {DispatchTripResource} resource - Dispatch trip resource.
     * @returns {DispatchTrip} Dispatch trip entity.
     */
    static toEntityFromResource(resource) {
        return new DispatchTrip({...resource});
    }

    /**
     * Converts an HTTP response into dispatch trip entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {DispatchTrip[]} Dispatch trip entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data['dispatchTrips'];

        return resources.map(resource =>
            this.toEntityFromResource(new DispatchTripResource(resource))
        );
    }
}