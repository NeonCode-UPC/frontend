import { useI18n } from 'vue-i18n';

const intlLocales = { es: 'es-PE', en: 'en-US' };

/**
 * Locale-aware formatters for the Smart Container & Telemetry Monitoring views.
 * Keeps number, unit and date formatting out of the templates.
 */
export function useTelemetryFormat() {
    const { t, locale } = useI18n();

    const intlLocale = () => intlLocales[locale.value] || locale.value;

    /**
     * @param {?number} value
     * @param {number} [digits=1]
     * @returns {string}
     */
    function formatNumber(value, digits = 1) {
        if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
        return new Intl.NumberFormat(intlLocale(), {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(Number(value));
    }

    const formatTemperature = (value, digits = 1) => `${formatNumber(value, digits)} °C`;

    const formatKilograms = (value, digits = 1) => `${formatNumber(value, digits)} kg`;

    /**
     * Signed weight difference, e.g. "+2.4 kg" or "−0.8 kg".
     * Accepts numbers or legacy strings such as "-0.8 kg".
     */
    function formatWeightDiff(value) {
        const amount = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(',', '.'));
        if (Number.isNaN(amount)) return '—';
        const sign = amount > 0 ? '+' : '';
        return `${sign}${formatKilograms(amount)}`;
    }

    /**
     * @param {?string} isoString
     * @returns {string} Localized short date and time.
     */
    function formatDateTime(isoString) {
        if (!isoString) return '—';
        // Timestamps are read as wall-clock time, the same way TelemetryLog extracts its `time` label,
        // so the date shown here matches the times listed in the history table.
        const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        const date = match
            ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]))
            : new Date(isoString);
        if (Number.isNaN(date.getTime())) return String(isoString);
        return new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'short', timeStyle: 'short' }).format(date);
    }

    /**
     * Label for a container connectivity / operational state.
     * @param {Object} container
     * @returns {{ key: string, label: string }}
     */
    function containerState(container) {
        let key = 'stable';
        if (container.status === 'offline') key = 'offline';
        else if (container.thermalState === 'critical' || container.status === 'warning') key = 'critical';
        else if (!container.ambulancePlate || container.status === 'unlinked') key = 'available';
        return { key, label: t(`telemetry.state.${key}`) };
    }

    /**
     * Human description of a payload movement, derived from its type and units.
     * @param {Object} movement
     */
    function movementDescription(movement) {
        const count = Math.abs(Number(movement.units) || 0);
        return t(`telemetry.movement.${movement.type || 'deposit'}`, { count }, count);
    }

    return {
        formatNumber,
        formatTemperature,
        formatKilograms,
        formatWeightDiff,
        formatDateTime,
        containerState,
        movementDescription
    };
}
