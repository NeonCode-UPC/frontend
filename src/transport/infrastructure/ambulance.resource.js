/**
 * Infrastructure resource representing an ambulance.
 *
 * @class AmbulanceResource
 */
export class AmbulanceResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Ambulance identifier.
     * @param {string} params.plate - Ambulance license plate.
     * @param {string} params.driver - Assigned driver.
     * @param {string} params.status - Ambulance status.
     */
    constructor({
                    id,
                    plate,
                    driver,
                    status
                }) {
        this.id = id;
        this.plate = plate;
        this.driver = driver;
        this.status = status;
    }
}