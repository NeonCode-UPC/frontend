<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTelemetryFormat } from '../composables/use-telemetry-format.js';

const props = defineProps({
  containerId: {
    type: String,
    required: true
  },
  /** Container that is not responding (null when every container is reporting). */
  offlineContainer: {
    type: Object,
    default: null
  },
  /** Last reading timestamp of the selected container (ISO). */
  lastReadingAt: {
    type: String,
    default: null
  },
  /**
   * Display mode:
   * 'gallery' (default): shows both Figma MBA-54 cards side-by-side
   * 'loading': shows only the loading card
   * 'offline': shows only the offline error card
   */
  mode: {
    type: String,
    default: 'gallery'
  }
});

const emit = defineEmits(['retry']);
const { t } = useI18n();
const { formatTemperature, formatDateTime } = useTelemetryFormat();

const isRetrying = ref(false);

function handleRetry() {
  isRetrying.value = true;
  emit('retry');
  setTimeout(() => {
    isRetrying.value = false;
  }, 1800);
}
</script>

<template>
  <div class="offline-state-banner flex flex-column gap-3">
    <div class="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2">
      <div>
        <div class="breadcrumb-text mb-1">
          {{ t('telemetry.live.breadcrumb') }} / <strong>{{ containerId }}</strong>
        </div>
        <h1 class="screen-title m-0">
          {{ t('telemetry.history.title', { id: containerId }) }}
        </h1>
        <p class="subtitle-text m-0 mt-1">
          {{ t('telemetry.offline.subtitle') }}
        </p>
      </div>
    </div>

    <div class="grid m-0">
      <!-- Card 1: Fetching telemetry -->
      <div
        v-if="mode === 'gallery' || mode === 'loading'"
        :class="mode === 'gallery' ? 'col-12 lg:col-6 p-0 pr-0 lg:pr-3 mb-3 lg:mb-0' : 'col-12 p-0'"
      >
        <div
          class="connection-state-card screen-card border-round-2xl p-5 flex flex-column align-items-center justify-content-center text-center"
          role="status"
          aria-live="polite"
        >
          <div class="spinner-wrapper mb-4" aria-hidden="true">
            <div class="teal-circular-spinner"></div>
          </div>

          <h2 class="state-card-title m-0 mb-2">
            {{ t('telemetry.offline.loading-title') }}
          </h2>
          <p class="state-card-desc m-0 text-muted">
            {{ t('telemetry.offline.last-reading', { at: formatDateTime(lastReadingAt) }) }}
          </p>
        </div>
      </div>

      <!-- Card 2: Telemetry could not be retrieved -->
      <div
        v-if="mode === 'gallery' || mode === 'offline'"
        :class="mode === 'gallery' ? 'col-12 lg:col-6 p-0 pl-0 lg:pl-3' : 'col-12 p-0'"
      >
        <div
          class="connection-state-card screen-card border-round-2xl p-5 flex flex-column align-items-center justify-content-center text-center"
          role="alert"
        >
          <div class="offline-icon-badge mb-4 flex align-items-center justify-content-center" aria-hidden="true">
            <svg class="wifi-off-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#E05A46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 1l22 22" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" stroke-width="2.5" />
            </svg>
          </div>

          <template v-if="offlineContainer">
            <h2 class="state-card-title m-0 mb-2">
              {{ t('telemetry.offline.error-title') }}
            </h2>
            <p class="state-card-desc m-0 text-muted mb-4">
              {{ t('telemetry.offline.error-detail', {
                id: offlineContainer.id,
                temp: formatTemperature(offlineContainer.currentTemperature),
                at: formatDateTime(offlineContainer.lastTelemetryAt)
              }) }}
            </p>

            <pv-button class="btn-retry" :loading="isRetrying" @click="handleRetry">
              <span>{{ t('telemetry.offline.retry') }}</span>
            </pv-button>
          </template>
          <template v-else>
            <h2 class="state-card-title m-0 mb-2">{{ t('telemetry.offline.all-online') }}</h2>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.offline-state-banner {
  width: 100%;
}

.breadcrumb-text {
  font-size: 0.72rem;
  color: #5A706A;
}

.breadcrumb-text strong {
  color: #10312F;
}

.screen-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #10312F;
  letter-spacing: -0.02em;
}

.subtitle-text {
  font-size: 0.8rem;
  color: #5A706A;
}

/* Connection State Cards */
.connection-state-card {
  min-height: 250px;
  background-color: #FFFFFF;
  border: 1px solid #E8E6DF;
}

/* Custom Teal Circular Spinner matching Figma */
.spinner-wrapper {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teal-circular-spinner {
  width: 44px;
  height: 44px;
  border: 3.5px solid #E3ECE7;
  border-top-color: #0F7A70;
  border-radius: 50%;
  animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

/* Red Offline Icon Badge */
.offline-icon-badge {
  width: 56px;
  height: 56px;
  background-color: #FDF2F0;
  border-radius: 16px;
}

.wifi-off-svg {
  display: block;
}

.state-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #10312F;
}

.state-card-desc {
  font-size: 0.8rem;
  color: #5A706A;
  max-width: 340px;
  line-height: 1.4;
}

/* Retry Button matching Figma MBA-54 */
.btn-retry {
  background-color: #0F7A70 !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 9999px !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  padding: 0.55rem 1.6rem !important;
  box-shadow: 0 2px 6px rgba(15, 122, 112, 0.25) !important;
  transition: all 0.2s ease !important;
}

.btn-retry:hover {
  background-color: #0C6159 !important;
  transform: translateY(-1px);
}
</style>
