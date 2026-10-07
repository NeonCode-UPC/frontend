import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../shared/infrastructure/base-api.js";

const transportOrdersEndpointPath =
    import.meta.env.VITE_TRANSPORT_ORDERS_ENDPOINT_PATH || '/transport-orders';

const dispatchTripsEndpointPath =
    import.meta.env.VITE_DISPATCH_TRIPS_ENDPOINT_PATH || '/dispatch-trips';

const ambulancesEndpointPath =
    import.meta.env.VITE_AMBULANCES_ENDPOINT_PATH || '/ambulances';

/**
 * Infrastructure gateway for the Medical Transport Planning & Dispatching
 * bounded-context endpoints.
 *
 * @class TransportApi
 * @extends BaseApi
 */
export class TransportApi extends BaseApi {
    #transportOrdersEndpoint;
    #dispatchTripsEndpoint;
    #ambulancesEndpoint;

    /**
     * Creates endpoint clients for transport orders,
     * dispatch trips, and ambulances.
     */
    constructor() {
        super();

        this.#transportOrdersEndpoint =
            new BaseEndpoint(this, transportOrdersEndpointPath);

        this.#dispatchTripsEndpoint =
            new BaseEndpoint(this, dispatchTripsEndpointPath);

        this.#ambulancesEndpoint =
            new BaseEndpoint(this, ambulancesEndpointPath);
    }

    /**
     * Retrieves transport orders.
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getTransportOrders() {
        return this.#transportOrdersEndpoint.getAll();
    }

    /**
     * Retrieves dispatch trips.
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getDispatchTrips() {
        return this.#dispatchTripsEndpoint.getAll();
    }

    /**
     * Retrieves ambulances.
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getAmbulances() {
        return this.#ambulancesEndpoint.getAll();
    }

    /**
     * Creates a transport order.
     *
     * @param {Object} transportOrder
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createTransportOrder(transportOrder) {
        return this.#transportOrdersEndpoint.create(transportOrder);
    }

    /**
     * Updates a dispatch trip.
     *
     * @param {string|number} id
     * @param {Object} dispatchTrip
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateDispatchTrip(id, dispatchTrip) {
        return this.#dispatchTripsEndpoint.update(id, dispatchTrip);
    }
}