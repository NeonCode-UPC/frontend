import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Shared infrastructure base class configuring the Axios HTTP client.
 *
 * @class BaseApi
 */
export class BaseApi {
    /**
     * @private
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios HTTP client with baseURL and standard headers.
     */
    constructor(baseURL = apiUrl) {
        this.#http = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Exposes configured Axios instance.
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}
