<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCustodyStore } from '../../application/custody-store.js';

const route = useRoute();
const store = useCustodyStore();
onMounted(() => store.load());
const manifest = computed(() => store.manifests.find((item) => item.transferId === route.query.transfer) || store.manifests[0] || null);
const transfer = computed(() => store.findTransfer(manifest.value?.transferId));
const printManifest = () => window.print();
</script>

<template>
  <base-screen
    breadcrumb="Actas digitales"
    title="Acta digital"
    subtitle="Manifiesto sellado con SHA-256 e inmutable"
    :fluid="true"
  >
    <template #actions>
      <pv-button
        v-if="manifest"
        label="Descargar PDF"
        icon="pi pi-download"
        class="border-round-pill"
        @click="printManifest"
      />
    </template>

    <div v-if="manifest" class="records-page">
      <content-card>
        <div class="manifest-grid">
          <article class="document-preview">
            <h3 class="document-title">Acta de traslado {{ manifest.transferId }}</h3>
            <p>
              <strong>Carga:</strong> {{ manifest.cargo }}
              <template v-if="transfer?.temperatureRange">
                <span class="text-secondary">· {{ transfer.temperatureRange }}</span>
              </template>
            </p>
            <p><strong>Recibido por:</strong> {{ manifest.recipient }}</p>
            <p><strong>Fecha y hora:</strong> {{ manifest.sealedAt.replace(' · ', ' ') }}</p>
            <p>
              <strong>Temperatura máx.:</strong> {{ manifest.temperatureMax }}
              <span class="text-secondary">· aperturas:</span> {{ manifest.openings }}
            </p>
          </article>
          <aside class="seal-panel">
            <h2>Sellado</h2>
            <div class="seal-row">
              <strong>Estado</strong>
              <status-badge
                :status="manifest.status === 'valid' ? 'active' : manifest.status"
                :label="manifest.status === 'valid' ? 'Válido' : manifest.status"
              />
            </div>
            <div class="seal-row">
              <strong>SHA-256</strong>
              <span class="hash-text">{{ manifest.hash ? `${manifest.hash.slice(0, 4)}…${manifest.hash.slice(-4)}` : '—' }}</span>
            </div>
          </aside>
        </div>
      </content-card>
    </div>
    <div v-else class="loading-state">
      <div v-if="store.loading" class="p-5 text-center text-muted text-sm">
        <i class="pi pi-spin pi-spinner mr-2"></i>Cargando actas digitales…
      </div>
      <empty-state
        v-else
        icon="pi pi-file"
        title="No hay actas digitales disponibles"
        :message="store.error || 'No se encontró el acta digital seleccionada.'"
        :action-label="store.error ? 'Reintentar' : ''"
        @action="store.load()"
      />
    </div>
  </base-screen>
</template>

<style scoped src="../styles/digital-records-view.css"></style>
