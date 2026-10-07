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
    :breadcrumb="manifest ? `Actas digitales / ${manifest.transferId}` : 'Actas digitales'"
    :title="manifest ? `Acta digital ${manifest.transferId}` : 'Acta digital'"
    :subtitle="transfer?.route || 'Callao → Chincha'"
    :fluid="true"
  >
    <template #actions>
      <pv-button
        v-if="manifest"
        label="Descargar PDF"
        icon="pi pi-download"
        class="border-round-pill btn-download-pdf font-bold text-xs"
        @click="printManifest"
      />
    </template>

    <div v-if="manifest" class="manifest-cards-layout">
      <!-- Tarjeta 1: Acta de traslado -->
      <article class="doc-card">
        <h3 class="doc-title">Acta de traslado {{ manifest.transferId }}</h3>
        <div class="doc-rows">
          <p class="doc-row">
            <strong class="row-label">Carga:</strong>
            <span class="row-value">
              {{ manifest.cargo.toLowerCase() }}
              <template v-if="transfer?.temperatureRange">
                · {{ transfer.temperatureRange }}
              </template>
            </span>
          </p>
          <p class="doc-row">
            <strong class="row-label">Recibido por:</strong>
            <span class="row-value">{{ manifest.recipient }}</span>
          </p>
          <p class="doc-row">
            <strong class="row-label">Fecha y hora:</strong>
            <span class="row-value">{{ manifest.sealedAt.replace(' · ', ' ') }}</span>
          </p>
          <p class="doc-row">
            <strong class="row-label">Temperatura máx.:</strong>
            <span class="row-value">{{ manifest.temperatureMax }} · aperturas: {{ manifest.openings }}</span>
          </p>
        </div>
      </article>

      <!-- Tarjeta 2: Sellado -->
      <aside class="seal-card">
        <h3 class="seal-title">Sellado</h3>
        <div class="seal-rows">
          <div class="seal-row border-bottom-subtle">
            <strong class="seal-label">Estado</strong>
            <span class="seal-desc">Manifiesto sellado</span>
            <span class="seal-badge-valid">
              <span class="badge-dot"></span>
              Válido
            </span>
          </div>
          <div class="seal-row">
            <strong class="seal-label">SHA-256</strong>
            <span class="hash-text">
              {{ manifest.hash ? `${manifest.hash.slice(0, 4)}...${manifest.hash.slice(-4)}` : '9f2c...a71e' }}
            </span>
          </div>
        </div>
      </aside>
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
