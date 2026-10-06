import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

class AlertingApi extends BaseApi {
    constructor() {
        super();
        this.incidents = new BaseEndpoint(this, '/critical-incidents');
    }

    acknowledge(id, acknowledgedAt) {
        return this.http.patch(`/critical-incidents/${id}`, { acknowledgedAt });
    }

    resolve(id, resolution) {
        return this.http.patch(`/critical-incidents/${id}`, {
            status: 'resolved',
            resolution,
            resolvedAt: new Date().toISOString()
        });
    }
}

export const alertingApi = new AlertingApi();
