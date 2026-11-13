/**
 * Infrastructure resource representing a transport order received from the backend API.
 *
 * @class TransportOrderResource
 */
export class TransportOrderResource {
    /**
     * @param {Object} params - Resource payload from the REST API.
     * @param {string} params.id
     * @param {string} [params.orderCode]
     * @param {string} [params.originHospitalId]
     * @param {string} [params.destinationHospitalId]
     * @param {string} [params.priority]
     * @param {string} [params.status]
     * @param {string} [params.cargoType]
     * @param {string} [params.cargoDescription]
     * @param {number} [params.maxSafeHours]
     * @param {number} [params.warningThresholdHours]
     * @param {string} [params.createdByUserId]
     * @param {string} [params.createdAt]
     */
    constructor({
        id,
        orderCode,
        originHospitalId,
        destinationHospitalId,
        priority,
        status,
        cargoType,
        cargoDescription,
        maxSafeHours,
        warningThresholdHours,
        createdByUserId,
        createdAt
    }) {
        this.id = id;
        this.orderCode = orderCode || null;
        this.originHospitalId = originHospitalId || null;
        this.destinationHospitalId = destinationHospitalId || null;
        this.priority = priority || null;
        this.status = status || null;
        this.cargoType = cargoType || null;
        this.cargoDescription = cargoDescription || null;
        this.maxSafeHours = maxSafeHours ?? null;
        this.warningThresholdHours = warningThresholdHours ?? null;
        this.createdByUserId = createdByUserId || null;
        this.createdAt = createdAt || null;
    }
}