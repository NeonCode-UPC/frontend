/**
 * Infrastructure resource payload for a SmartContainer returned by the REST API or json-server.
 * Supports both official database columns (`smart_containers` table), .NET backend resources, and UI state properties.
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
        container_status,
        lockState,
        lock_state,
        currentTemperatureCelsius,
        current_temperature_celsius,
        minTemperatureCelsius,
        min_temperature_celsius,
        maxTemperatureCelsius,
        max_temperature_celsius,
        warningTemperatureCelsius,
        warning_temperature_celsius,
        excursionToleranceSeconds,
        excursion_tolerance_seconds,
        tareWeightGrams,
        tare_weight_grams,
        netWeightGrams,
        net_weight_grams,
        batteryPercentage,
        battery_percentage,
        batteryWarningPercentage,
        is12vConnected,
        is_12v_connected,
        is12VConnected,
        lastTelemetryAt,
        last_telemetry_at,
        createdAt,
        created_at,
        updatedAt,
        updated_at,
        model,
        ambulancePlate,
        ambulance_plate,
        assignedAmbulancePlate,
        currentTransferId,
        current_transfer_id,
        currentTemperature,
        targetMinTemperature,
        targetMaxTemperature,
        warningTemperature,
        batteryLevel,
        lidStatus,
        netWeight,
        tareWeight,
        signalQuality,
        signal_quality,
        location,
        status,
        unitWeight,
        estimatedUnits,
        movements
    } = {}) {
        this.id = id;
        this.serialNumber = serialNumber ?? serial_number ?? (typeof id === 'string' && id.startsWith('SB-') ? id : '');
        this.formFactor = formFactor ?? form_factor;
        this.containerStatus = containerStatus ?? container_status ?? status;
        this.lockState = lockState ?? lock_state;
        this.currentTemperatureCelsius = currentTemperatureCelsius ?? current_temperature_celsius ?? currentTemperature;
        this.minTemperatureCelsius = minTemperatureCelsius ?? min_temperature_celsius ?? targetMinTemperature;
        this.maxTemperatureCelsius = maxTemperatureCelsius ?? max_temperature_celsius ?? targetMaxTemperature;
        this.warningTemperatureCelsius = warningTemperatureCelsius ?? warning_temperature_celsius ?? warningTemperature;
        this.excursionToleranceSeconds = excursionToleranceSeconds ?? excursion_tolerance_seconds ?? 120;
        this.tareWeightGrams = tareWeightGrams ?? tare_weight_grams;
        this.netWeightGrams = netWeightGrams ?? net_weight_grams;
        this.batteryPercentage = batteryPercentage ?? battery_percentage ?? batteryLevel;
        this.batteryWarningPercentage = batteryWarningPercentage ?? 20;
        this.is12vConnected = is12vConnected ?? is_12v_connected ?? is12VConnected;
        this.lastTelemetryAt = lastTelemetryAt ?? last_telemetry_at;
        this.createdAt = createdAt ?? created_at;
        this.updatedAt = updatedAt ?? updated_at;
        this.model = model;
        this.ambulancePlate = ambulancePlate ?? ambulance_plate ?? assignedAmbulancePlate;
        this.assignedAmbulancePlate = this.ambulancePlate;
        this.currentTransferId = currentTransferId ?? current_transfer_id;
        this.currentTemperature = currentTemperature ?? this.currentTemperatureCelsius;
        this.targetMinTemperature = targetMinTemperature ?? this.minTemperatureCelsius ?? 2.0;
        this.targetMaxTemperature = targetMaxTemperature ?? this.maxTemperatureCelsius ?? 8.0;
        this.warningTemperature = warningTemperature ?? this.warningTemperatureCelsius ?? 7.5;
        this.batteryLevel = batteryLevel ?? this.batteryPercentage;
        this.lidStatus = lidStatus ?? (this.lockState === 'Locked' ? 'closed' : 'open');
        this.netWeight = netWeight ?? (this.netWeightGrams !== undefined ? Number((this.netWeightGrams / 1000).toFixed(2)) : undefined);
        this.tareWeight = tareWeight ?? (this.tareWeightGrams !== undefined ? Number((this.tareWeightGrams / 1000).toFixed(2)) : undefined);
        this.signalQuality = signalQuality ?? signal_quality;
        this.location = location;
        this.status = status;
        this.unitWeight = unitWeight;
        this.estimatedUnits = estimatedUnits;
        this.movements = movements || [];
    }
}
