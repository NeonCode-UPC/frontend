/**
 * Ambulance entity used by the
 * Medical Transport Planning & Dispatching bounded context.
 *
 * @class Ambulance
 */
export class Ambulance {
    /**
     * @param {Object} params - Ambulance attributes.
     * @param {string|number} params.id - Unique ambulance identifier.
     * @param {string} params.plate - Ambulance license plate.
     * @param {string} params.driver - Assigned driver.
     * @param {string} params.status - Current ambulance status.
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