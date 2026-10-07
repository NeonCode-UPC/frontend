import { SmartContainer } from "../domain/smart-container.entity.js";
import { SmartContainerResource } from "./smart-container.resource.js";

/**
 * Maps SmartContainer resources from infrastructure into domain entities.
 *
 * @class SmartContainerAssembler
 */
export class SmartContainerAssembler {
    /**
     * Converts a resource into a SmartContainer entity.
     *
     * @param {SmartContainerResource|Object} resource
     * @returns {SmartContainer}
     */
    static toEntityFromResource(resource) {
        return new SmartContainer({ ...resource });
    }

    /**
     * Converts an HTTP Axios response into an array of SmartContainer entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response
     * @returns {SmartContainer[]}
     */
    static toEntitiesFromResponse(response) {
        if (!response || response.status !== 200) {
            console.error(response ? `Status: ${response.status}` : 'No response');
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data['smart-containers'] || [];

        return resources.map(resource =>
            this.toEntityFromResource(new SmartContainerResource(resource))
        );
    }
}
