/**
 * Reusable endpoint client offering standard CRUD operations over resources.
 *
 * @class BaseEndpoint
 */
export class BaseEndpoint {
    /**
     * @param {import('./base-api.js').BaseApi} baseApi - Owner API instance.
     * @param {string} endpointPath - Resource URL path.
     */
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    /**
     * Retrieves all items from resource collection.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getAll() {
        return this.http.get(this.endpointPath);
    }

    /**
     * Retrieves a single item by id.
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    /**
     * Creates a new resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    /**
     * Updates an existing resource by id.
     * @param {string|number} id
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    /**
     * Deletes a resource by id.
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}
