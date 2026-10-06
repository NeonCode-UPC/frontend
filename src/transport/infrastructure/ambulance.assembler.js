import {Ambulance} from "../domain/ambulance.entity.js";
import {AmbulanceResource} from "./ambulance.resource.js";

/**
 * Maps ambulance infrastructure resources into domain entities.
 *
 * @class AmbulanceAssembler
 */
export class AmbulanceAssembler {
    /**
     * Converts a resource into an Ambulance entity.
     *
     * @param {AmbulanceResource} resource - Ambulance resource.
     * @returns {Ambulance} Ambulance entity.
     */
    static toEntityFromResource(resource) {
        return new Ambulance({...resource});
    }

    /**
     * Converts an HTTP response into ambulance entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {Ambulance[]} Ambulance entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data['ambulances'];

        return resources.map(resource =>
            this.toEntityFromResource(new AmbulanceResource(resource))
        );
    }
}