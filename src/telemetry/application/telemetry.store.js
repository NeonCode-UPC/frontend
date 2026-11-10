import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TelemetryApi } from "../infrastructure/telemetry-api.js";
import { SmartContainerAssembler } from "../infrastructure/smart-container.assembler.js";
import { TelemetryLogAssembler } from "../infrastructure/telemetry-log.assembler.js";
import { TelemetryLog } from "../domain/telemetry-log.entity.js";

/** @typedef {import('../domain/link-container.command.js').LinkContainerCommand} LinkContainerCommand */
/** @typedef {import('../domain/unlink-container.command.js').UnlinkContainerCommand} UnlinkContainerCommand */
/** @typedef {import('../domain/record-weight-withdrawal.command.js').RecordWeightWithdrawalCommand} RecordWeightWithdrawalCommand */
/** @typedef {import('../domain/configure-thermal-thresholds.command.js').ConfigureThermalThresholdsCommand} ConfigureThermalThresholdsCommand */

const telemetryApi = new TelemetryApi();

/**
 * Pinia store managing state and use cases for the Smart Container & Telemetry Monitoring bounded context.
 * Connects directly to the ASP.NET Core backend REST API while retaining graceful fallback compatibility.
 *
 * @module useTelemetryStore
 */
export const useTelemetryStore = defineStore('telemetry', () => {
    const containers = ref([]);
    const selectedContainer = ref(null);
    const telemetryLogs = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    // Computed properties
    const totalContainersCount = computed(() => containers.value.length);
    const onlineContainers = computed(() => containers.value.filter(c => c.status === 'online'));
    const warningContainers = computed(() => containers.value.filter(c => c.status === 'warning'));
    const offlineContainers = computed(() => containers.value.filter(c => c.status === 'offline'));
    const unlinkedContainers = computed(() => containers.value.filter(c => c.status === 'unlinked' || !c.ambulancePlate));

    /**
     * Resolves a container reference by ID or serial number.
     * @param {string|number} identifier
     * @returns {import('../domain/smart-container.entity.js').SmartContainer|undefined}
     */
    function findContainer(identifier) {
        if (!identifier && identifier !== 0) return undefined;
        return containers.value.find(c =>
            String(c.id) === String(identifier) ||
            String(c.serialNumber) === String(identifier)
        );
    }

    /**
     * Updates an entity in local reactive state.
     * @param {import('../domain/smart-container.entity.js').SmartContainer} updated
     */
    function updateLocalContainer(updated) {
        const index = containers.value.findIndex(c =>
            String(c.id) === String(updated.id) ||
            (c.serialNumber && updated.serialNumber && c.serialNumber === updated.serialNumber)
        );
        if (index !== -1) {
            containers.value[index] = updated;
        } else {
            containers.value.push(updated);
        }

        if (selectedContainer.value && (
            String(selectedContainer.value.id) === String(updated.id) ||
            selectedContainer.value.serialNumber === updated.serialNumber
        )) {
            selectedContainer.value = updated;
        }
    }

    /**
     * Loads all smart containers from the infrastructure API.
     */
    async function fetchContainers() {
        loading.value = true;
        try {
            const response = await telemetryApi.getContainers();
            containers.value = SmartContainerAssembler.toEntitiesFromResponse(response);
            errors.value = [];

            // Default to the first linked container if none is selected yet
            if (!selectedContainer.value && containers.value.length > 0) {
                selectedContainer.value = containers.value.find(c => c.isLinked) || containers.value[0];
            }
        } catch (error) {
            console.error('Error fetching containers:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Loads a specific container by its ID or serial number.
     * @param {string|number} id
     */
    async function fetchContainerById(id) {
        loading.value = true;
        try {
            let response;
            if (typeof id === 'string' && id.startsWith('SB-')) {
                response = await telemetryApi.getContainerBySerialNumber(id).catch(() => telemetryApi.getContainerById(id));
            } else {
                response = await telemetryApi.getContainerById(id);
            }
            const entity = SmartContainerAssembler.toEntityFromResource(response.data);
            selectedContainer.value = entity;
            updateLocalContainer(entity);
            errors.value = [];
        } catch (error) {
            console.error(`Error fetching container ${id}:`, error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Loads telemetry logs, optionally filtered by container ID or active selection.
     * @param {?string|number} [containerId=null]
     */
    async function fetchTelemetryLogs(containerId = null) {
        loading.value = true;
        try {
            const target = containerId ? findContainer(containerId) : selectedContainer.value;
            const targetId = target?.serialNumber || target?.id || containerId;

            let response;
            if (targetId) {
                response = await telemetryApi.getTelemetryLogsByContainerId(targetId);
            } else {
                response = await telemetryApi.getTelemetryLogs().catch(() => ({ status: 200, data: [] }));
            }
            telemetryLogs.value = TelemetryLogAssembler.toEntitiesFromResponse(response);
            errors.value = [];
        } catch (error) {
            console.error('Error fetching telemetry logs:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Persists a container through the assembler and refreshes local state.
     * @param {import('../domain/smart-container.entity.js').SmartContainer} entity
     */
    async function persistContainer(entity) {
        const response = await telemetryApi.updateContainer(
            entity.id,
            SmartContainerAssembler.toResourceFromEntity(entity)
        );
        const updated = SmartContainerAssembler.toEntityFromResource(response.data);
        updateLocalContainer(updated);
        return updated;
    }

    /**
     * Runs a use case over one container with shared loading and error handling.
     * @param {string|number} containerId
     * @param {(draft: import('../domain/smart-container.entity.js').SmartContainer) => void} mutate
     */
    async function executeOnContainer(containerId, mutate) {
        loading.value = true;
        try {
            const current = findContainer(containerId);
            if (!current) throw new Error(`SmartContainer ${containerId} not found.`);
            const draft = SmartContainerAssembler.toEntityFromResource(
                SmartContainerAssembler.toResourceFromEntity(current)
            );
            mutate(draft);
            await persistContainer(draft);
            errors.value = [];
        } catch (error) {
            console.error(`Error updating container ${containerId}:`, error);
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Links a SmartBox to an ambulance (US08 / POST /api/v1/smart-containers/{id}/pair).
     * @param {LinkContainerCommand} command
     */
    async function linkContainer(command) {
        loading.value = true;
        try {
            const target = findContainer(command.containerId);
            const targetId = target?.id ?? command.containerId;

            try {
                // 1. Dedicated ASP.NET Core backend endpoint
                const response = await telemetryApi.pairContainer(targetId, command.ambulancePlate);
                const updated = SmartContainerAssembler.toEntityFromResource(response.data);
                updateLocalContainer(updated);
            } catch (pairError) {
                // 2. Graceful fallback to PUT update for mock server
                await executeOnContainer(targetId, draft => {
                    draft.ambulancePlate = command.ambulancePlate;
                    draft.status = 'online';
                    draft.containerStatus = 'LockedAndReady';
                    draft.lastTelemetryAt = TelemetryLog.currentTimestamp();
                });
            }
            errors.value = [];
        } catch (error) {
            console.error(`Error linking container ${command.containerId}:`, error);
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Unlinks a SmartBox from its current ambulance (US08 / POST /api/v1/smart-containers/{id}/unlink).
     * @param {UnlinkContainerCommand} command
     */
    async function unlinkContainer(command) {
        loading.value = true;
        try {
            const target = findContainer(command.containerId);
            const targetId = target?.id ?? command.containerId;

            try {
                // 1. Dedicated ASP.NET Core backend endpoint
                const response = await telemetryApi.unlinkContainer(targetId);
                const updated = SmartContainerAssembler.toEntityFromResource(response.data);
                updateLocalContainer(updated);
            } catch (unlinkError) {
                // 2. Graceful fallback to PUT update for mock server
                await executeOnContainer(targetId, draft => {
                    draft.ambulancePlate = null;
                    draft.currentTransferId = null;
                    draft.status = 'unlinked';
                    draft.containerStatus = 'Available';
                });
            }
            errors.value = [];
        } catch (error) {
            console.error(`Error unlinking container ${command.containerId}:`, error);
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Records a weight change detected by the HX711 load cell (US11 / POST /api/v1/smart-containers/{id}/weight-movements).
     * @param {RecordWeightWithdrawalCommand} command
     */
    async function recordWeightMovement(command) {
        loading.value = true;
        try {
            const target = findContainer(command.containerId);
            const targetId = target?.id ?? command.containerId;

            try {
                // 1. Dedicated ASP.NET Core backend endpoint
                const payload = {
                    netWeightGrams: Math.round(command.weightDiff * 1000),
                    unitsDifference: command.units,
                    responsibleUser: command.responsible,
                    reason: command.weightDiff < 0 ? 'Biological payload withdrawal' : 'Biological payload deposit'
                };
                const response = await telemetryApi.recordWeightMovement(targetId, payload);
                const updated = SmartContainerAssembler.toEntityFromResource(response.data);
                updateLocalContainer(updated);
            } catch (movementError) {
                // 2. Graceful fallback to local draft update and PUT for mock server
                await executeOnContainer(targetId, draft => {
                    const now = new Date();
                    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const sign = command.weightDiff > 0 ? '+' : '';
                    draft.movements = [...draft.movements, {
                        id: `MOV-${now.getTime()}`,
                        time,
                        type: command.weightDiff < 0 ? 'withdrawal' : 'deposit',
                        weightDiff: `${sign}${command.weightDiff} kg`,
                        units: command.units,
                        responsible: command.responsible
                    }];
                    draft.netWeight = Number((draft.netWeight + command.weightDiff).toFixed(2));
                    draft.netWeightGrams = Math.max(0, Number((draft.netWeightGrams + command.weightDiff * 1000).toFixed(2)));
                    draft.estimatedUnits = Math.max(0, draft.estimatedUnits + command.units);
                });
            }
            errors.value = [];
        } catch (error) {
            console.error(`Error recording weight movement on ${command.containerId}:`, error);
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Records an IoT telemetry snapshot and synchronizes it to container parameters.
     * @param {string|number} containerId
     * @param {Object} snapshot
     */
    async function recordTelemetrySnapshot(containerId, snapshot) {
        try {
            const target = findContainer(containerId);
            const targetId = target?.id ?? containerId;
            const serial = target?.serialNumber || String(targetId);

            // Transmit IoT reading to telemetry-logs collection
            await telemetryApi.createTelemetryLog({
                containerId: serial,
                temperatureCelsius: snapshot.temperatureCelsius ?? snapshot.temperature,
                ambientTemperatureCelsius: snapshot.ambientTemperatureCelsius ?? 22.0,
                weightGrams: snapshot.weightGrams ?? (target ? target.netWeightGrams : 2400.0),
                batteryPercentage: snapshot.batteryPercentage ?? snapshot.batteryLevel ?? 95.0,
                is12vConnected: snapshot.is12vConnected ?? true,
                peltierPowerPct: snapshot.peltierPowerPct ?? 45,
                lidLockEngaged: snapshot.lidLockEngaged ?? true,
                firmwareSignature: 'ESP32-FW-v2.4.1'
            }).catch(err => console.warn('Could not post IoT log:', err));

            // Synchronize live snapshot to container aggregate
            const response = await telemetryApi.recordContainerTelemetrySnapshot(targetId, {
                temperatureCelsius: snapshot.temperatureCelsius ?? snapshot.temperature,
                batteryPercentage: snapshot.batteryPercentage ?? snapshot.batteryLevel ?? 95.0,
                is12vConnected: snapshot.is12vConnected ?? true,
                netWeightGrams: snapshot.weightGrams ?? (target ? target.netWeightGrams : 2400.0),
                signalQuality: snapshot.signalQuality || 'strong'
            });

            const updated = SmartContainerAssembler.toEntityFromResource(response.data);
            updateLocalContainer(updated);
            return updated;
        } catch (error) {
            console.error('Error recording telemetry snapshot:', error);
            throw error;
        }
    }

    /**
     * Updates preservation thresholds and alerts for a SmartBox (US13).
     * @param {ConfigureThermalThresholdsCommand} command
     */
    async function updateContainerRules(command) {
        await executeOnContainer(command.containerId, draft => {
            draft.targetMinTemperature = command.thresholds.minCelsius;
            draft.targetMaxTemperature = command.thresholds.maxCelsius;
            draft.warningTemperature = command.thresholds.warningCelsius;
            draft.batteryWarningPercentage = command.batteryWarning;
        });
    }

    function selectContainer(container) {
        selectedContainer.value = container;
    }

    return {
        containers,
        selectedContainer,
        telemetryLogs,
        loading,
        errors,
        totalContainersCount,
        onlineContainers,
        warningContainers,
        offlineContainers,
        unlinkedContainers,
        fetchContainers,
        fetchContainerById,
        fetchTelemetryLogs,
        linkContainer,
        unlinkContainer,
        recordWeightMovement,
        recordTelemetrySnapshot,
        updateContainerRules,
        selectContainer
    };
});
