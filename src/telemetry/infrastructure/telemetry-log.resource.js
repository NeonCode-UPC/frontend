/**
 * Infrastructure resource payload for a TelemetryLog record returned by the REST API or json-server.
 * Aligned with the 15 columns of Table 5 (`telemetry_logs`) in Chapter 4.8.1.2 and .NET TelemetryLogResource.
 *
 * @class TelemetryLogResource
 */
export class TelemetryLogResource {
    constructor({
        id,
        containerId,
        container_id,
        tripId,
        trip_id,
        timestampUtc,
        timestamp_utc,
        temperatureCelsius,
        temperature_celsius,
        ambientTemperatureCelsius,
        ambient_temperature_celsius,
        weightGrams,
        weight_grams,
        batteryPercentage,
        battery_percentage,
        is12vConnected,
        is_12v_connected,
        is12VConnected,
        peltierPowerPct,
        peltier_power_pct,
        lidLockEngaged,
        lid_lock_engaged,
        latitude,
        longitude,
        firmwareSignature,
        firmware_signature,
        isThermalExcursion,
        is_thermal_excursion,
        transferId,
        timestamp,
        time,
        temperature,
        netWeight,
        batteryLevel,
        lidStatus,
        status
    } = {}) {
        this.id = id;
        this.containerId = containerId ?? container_id;
        this.tripId = tripId ?? trip_id ?? transferId ?? null;
        this.timestampUtc = timestampUtc ?? timestamp_utc;
        this.temperatureCelsius = temperatureCelsius ?? temperature_celsius ?? temperature;
        this.ambientTemperatureCelsius = ambientTemperatureCelsius ?? ambient_temperature_celsius;
        this.weightGrams = weightGrams ?? weight_grams;
        this.batteryPercentage = batteryPercentage ?? battery_percentage ?? batteryLevel;
        this.is12vConnected = is12vConnected ?? is_12v_connected ?? is12VConnected;
        this.peltierPowerPct = peltierPowerPct ?? peltier_power_pct;
        this.lidLockEngaged = lidLockEngaged ?? lid_lock_engaged;
        this.latitude = latitude;
        this.longitude = longitude;
        this.firmwareSignature = firmwareSignature ?? firmware_signature;
        this.isThermalExcursion = isThermalExcursion ?? is_thermal_excursion;
        this.transferId = transferId ?? this.tripId;
        this.timestamp = timestamp;
        this.time = time;
        this.temperature = temperature ?? this.temperatureCelsius;
        this.netWeight = netWeight;
        this.batteryLevel = batteryLevel ?? this.batteryPercentage;
        this.lidStatus = lidStatus;
        this.status = status;
    }
}
