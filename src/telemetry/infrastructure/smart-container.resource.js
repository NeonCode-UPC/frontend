/**
 * Infrastructure resource payload for a SmartContainer returned by the REST API or json-server.
 * Supports both official database columns (`smart_containers` table) and UI state properties.
 *
 * @class SmartContainerResource
 */
export class SmartContainerResource {
    constructor({
        id,
        serialNumber,
        serial_number,
        formFactor,
        form_factor,
        containerStatus,
        lockState,
        lock_state,
        currentTemperatureCelsius,
        current_temperature_celsius,
        tareWeightGrams,
        tare_weight_grams,
        netWeightGrams,
        net_weight_grams,
        batteryPercentage,
        battery_percentage,
        is12vConnected,
        is_12v_connected,
        lastTelemetryAt,
        last_telemetry_at,
        createdAt,
        created_at,
        updatedAt,
        updated_at,
        model,
        ambulancePlate,
        currentTransferId,
        currentTemperature,
        targetMinTemperature,
        targetMaxTemperature,
        batteryLevel,
        lidStatus,
        netWeight,
        tareWeight,
        signalQuality,
        location,
        status,
        lastPing,
        unitWeight,
        estimatedUnits,
        movements
    } = {}) {
        this.id = id;
        this.serialNumber = serialNumber ?? serial_number;
        this.formFactor = formFactor ?? form_factor;
        this.containerStatus = containerStatus;
        this.lockState = lockState ?? lock_state;
        this.currentTemperatureCelsius = currentTemperatureCelsius ?? current_temperature_celsius;
        this.tareWeightGrams = tareWeightGrams ?? tare_weight_grams;
        this.netWeightGrams = netWeightGrams ?? net_weight_grams;
        this.batteryPercentage = batteryPercentage ?? battery_percentage;
        this.is12vConnected = is12vConnected ?? is_12v_connected;
        this.lastTelemetryAt = lastTelemetryAt ?? last_telemetry_at;
        this.createdAt = createdAt ?? created_at;
        this.updatedAt = updatedAt ?? updated_at;
        this.model = model;
        this.ambulancePlate = ambulancePlate;
        this.currentTransferId = currentTransferId;
        this.currentTemperature = currentTemperature ?? this.currentTemperatureCelsius;
        this.targetMinTemperature = targetMinTemperature;
        this.targetMaxTemperature = targetMaxTemperature;
        this.batteryLevel = batteryLevel ?? this.batteryPercentage;
        this.lidStatus = lidStatus;
        this.netWeight = netWeight;
        this.tareWeight = tareWeight;
        this.signalQuality = signalQuality;
        this.location = location;
        this.status = status;
        this.lastPing = lastPing;
        this.unitWeight = unitWeight;
        this.estimatedUnits = estimatedUnits;
        this.movements = movements || [];
    }
}
