export class CriticalIncident {
    constructor({
        id,
        code,
        type,
        severity,
        status,
        description,
        containerId,
        transportOrder,
        detectedAt,
        acknowledgedAt = null,
        hospital = null,
        etaMinutes = null,
        temperature = null,
        safeRange = null,
        resolution = null
    }) {
        this.id = id;
        this.code = code;
        this.type = type;
        this.severity = severity;
        this.status = status;
        this.description = description;
        this.containerId = containerId;
        this.transportOrder = transportOrder;
        this.detectedAt = detectedAt;
        this.acknowledgedAt = acknowledgedAt;
        this.hospital = hospital;
        this.etaMinutes = etaMinutes;
        this.temperature = temperature;
        this.safeRange = safeRange;
        this.resolution = resolution;
    }

    get isPending() {
        return this.status === 'pending';
    }

    get requiresAcknowledgement() {
        return this.isPending && !this.acknowledgedAt;
    }

    get triggersPreArrivalNotice() {
        return this.isPending && Number(this.etaMinutes) <= 10 && Boolean(this.hospital);
    }
}
