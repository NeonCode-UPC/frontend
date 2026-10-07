import {ref} from "vue";
import {defineStore} from "pinia";
import {TransportApi} from "../infrastructure/transport-api.js";
import {TransportOrderAssembler} from "../infrastructure/transport-order.assembler.js";
import {DispatchTripAssembler} from "../infrastructure/dispatch-trip.assembler.js";
import {AmbulanceAssembler} from "../infrastructure/ambulance.assembler.js";

/**
 * Pinia store for the Medical Transport Planning & Dispatching
 * bounded context.
 */
export const useTransportStore = defineStore('transport', () => {
    const transportApi = new TransportApi();

    const transportOrders = ref([]);
    const dispatchTrips = ref([]);
    const ambulances = ref([]);
    const errors = ref([]);

    /**
     * Loads transport orders from infrastructure.
     */
    function fetchTransportOrders() {
        return transportApi.getTransportOrders()
            .then(response => {
                transportOrders.value =
                    TransportOrderAssembler.toEntitiesFromResponse(response);

                errors.value = [];
            })
            .catch(error => {
                console.error('Error fetching transport orders:', error);
                errors.value.push(error);
            });
    }

    /**
     * Loads dispatch trips from infrastructure.
     */
    function fetchDispatchTrips() {
        return transportApi.getDispatchTrips()
            .then(response => {
                dispatchTrips.value =
                    DispatchTripAssembler.toEntitiesFromResponse(response);

                errors.value = [];
            })
            .catch(error => {
                console.error('Error fetching dispatch trips:', error);
                errors.value.push(error);
            });
    }

    /**
     * Loads ambulances from infrastructure.
     */
    function fetchAmbulances() {
        return transportApi.getAmbulances()
            .then(response => {
                ambulances.value =
                    AmbulanceAssembler.toEntitiesFromResponse(response);

                errors.value = [];
            })
            .catch(error => {
                console.error('Error fetching ambulances:', error);
                errors.value.push(error);
            });
    }

    /**
     * Clears application errors.
     */
    function clearErrors() {
        errors.value = [];
    }

    return {
        transportOrders,
        dispatchTrips,
        ambulances,
        errors,
        fetchTransportOrders,
        fetchDispatchTrips,
        fetchAmbulances,
        clearErrors
    };
});

export default useTransportStore;