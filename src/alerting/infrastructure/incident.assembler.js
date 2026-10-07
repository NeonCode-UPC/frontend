import { CriticalIncident } from '../domain/critical-incident.js';

export class IncidentAssembler {
    static toEntity(resource) {
        return new CriticalIncident({
            id: resource.id,
            code: resource.code,
            type: resource.type,
            severity: resource.severity,
            status: resource.status,
            description: resource.description,
            containerId: resource.containerId,
            transportOrder: resource.transportOrder,
            detectedAt: resource.detectedAt,
            acknowledgedAt: resource.acknowledgedAt ?? null,
            hospital: resource.hospital ?? null,
            etaMinutes: resource.etaMinutes ?? null,
            temperature: resource.temperature ?? null,
            safeRange: resource.safeRange ?? null,
            resolution: resource.resolution ?? null
        });
    }

    static toEntities(resources = []) {
        return resources.map(resource => IncidentAssembler.toEntity(resource));
    }
}
