import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TelemetryApi } from "../infrastructure/telemetry-api.js";
import { SmartContainerAssembler } from "../infrastructure/smart-container.assembler.js";
import { TelemetryLogAssembler } from "../infrastructure/telemetry-log.assembler.js";

const telemetryApi = new TelemetryApi();

/**
 * Pinia store managing state and use cases for the Smart Container & Telemetry Monitoring bounded context.
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
     * Loads all smart containers from the infrastructure API.
     */
    async function fetchContainers() {
        loading.value = true;
        try {
            const response = await telemetryApi.getContainers();
            containers.value = SmartContainerAssembler.toEntitiesFromResponse(response);
            errors.value = [];

            // Default to SB-0182 if selectedContainer is not set
            if (!selectedContainer.value && containers.value.length > 0) {
                const defaultTarget = containers.value.find(c => c.id === 'SB-0182') || containers.value[0];
                selectedContainer.value = defaultTarget;
            }
        } catch (error) {
            console.error('Error fetching containers:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Loads a specific container by its ID.
     * @param {string} id
     */
    async function fetchContainerById(id) {
        loading.value = true;
        try {
            const response = await telemetryApi.getContainerById(id);
            selectedContainer.value = SmartContainerAssembler.toEntityFromResource(response.data);
            errors.value = [];
        } catch (error) {
            console.error(`Error fetching container ${id}:`, error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Loads telemetry logs, optionally filtered by container ID.
     * @param {string} [containerId='SB-0182']
     */
    async function fetchTelemetryLogs(containerId = 'SB-0182') {
        loading.value = true;
        try {
            const response = containerId
                ? await telemetryApi.getTelemetryLogsByContainerId(containerId)
                : await telemetryApi.getTelemetryLogs();
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
     * Links a SmartBox to an ambulance (US08).
     * @param {Object} linkData
     */
    async function linkContainer({ containerId, ambulancePlate }) {
        loading.value = true;
        try {
            const target = containers.value.find(c => c.id === containerId);
            if (target) {
                target.ambulancePlate = ambulancePlate;
                target.status = 'online';
                target.lastPing = 'Hace 5 s';
                await telemetryApi.updateContainer(containerId, target);
                if (selectedContainer.value && selectedContainer.value.id === containerId) {
                    selectedContainer.value = { ...target };
                }
            }
            errors.value = [];
        } catch (error) {
            console.error(`Error linking container ${containerId}:`, error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Unlinks a SmartBox from its current ambulance.
     * @param {string} containerId
     */
    async function unlinkContainer(containerId) {
        loading.value = true;
        try {
            const target = containers.value.find(c => c.id === containerId);
            if (target) {
                target.ambulancePlate = null;
                target.status = 'unlinked';
                await telemetryApi.updateContainer(containerId, target);
                if (selectedContainer.value && selectedContainer.value.id === containerId) {
                    selectedContainer.value = { ...target };
                }
            }
            errors.value = [];
        } catch (error) {
            console.error(`Error unlinking container ${containerId}:`, error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Records a weight change detected by HX711 (US11).
     * @param {Object} payload
     */
    async function recordWeightMovement({ containerId, weightDiff, units, responsible }) {
        loading.value = true;
        try {
            const target = containers.value.find(c => c.id === containerId);
            if (target) {
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const newMovement = {
                    id: `MOV-${Date.now().toString().slice(-4)}`,
                    time: timeStr,
                    type: weightDiff < 0 ? 'withdrawal' : 'deposit',
                    description: weightDiff < 0 ? `Retiro de ${Math.abs(units)} viales` : `Ingreso de ${units} viales`,
                    weightDiff: `${weightDiff > 0 ? '+' : ''}${weightDiff} kg`,
                    units: units,
                    responsible: responsible || 'Marta Rojas'
                };
                target.netWeight = parseFloat((target.netWeight + weightDiff).toFixed(2));
                target.estimatedUnits = Math.max(0, target.estimatedUnits + units);
                target.movements.unshift(newMovement);
                await telemetryApi.updateContainer(containerId, target);
                if (selectedContainer.value && selectedContainer.value.id === containerId) {
                    selectedContainer.value = { ...target };
                }
            }
            errors.value = [];
        } catch (error) {
            console.error('Error recording weight movement:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Updates preservation temperature rules and alerts for a SmartBox.
     * @param {Object} payload
     */
    async function updateContainerRules({ containerId, minTemp, maxTemp, warningTemp, batteryWarning }) {
        loading.value = true;
        try {
            const target = containers.value.find(c => c.id === containerId);
            if (target) {
                target.targetMinTemperature = minTemp ?? target.targetMinTemperature;
                target.targetMaxTemperature = maxTemp ?? target.targetMaxTemperature;
                if (warningTemp !== undefined) target.warningTemp = warningTemp;
                if (batteryWarning !== undefined) target.batteryWarning = batteryWarning;
                await telemetryApi.updateContainer(containerId, target);
                if (selectedContainer.value && selectedContainer.value.id === containerId) {
                    selectedContainer.value = { ...target };
                }
            }
            errors.value = [];
        } catch (error) {
            console.error('Error updating container rules:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
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
        updateContainerRules,
        selectContainer
    };
});
