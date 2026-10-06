<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCustodyStore } from '../../application/custody-store.js';

const route = useRoute();
const store = useCustodyStore();
onMounted(() => store.load());
const manifest = computed(() => store.manifests.find((item) => item.transferId === route.query.transfer) || store.manifests[0]);
const transfer = computed(() => store.findTransfer(manifest.value?.transferId));
const printManifest = () => window.print();
</script>

<template>
  <section class="records-page" v-if="manifest">
    <header class="screen-title"><div><span class="breadcrumb">Actas digitales / <b>{{ manifest.transferId }}</b></span><h1>Acta digital {{ manifest.transferId }}</h1><p>{{ transfer?.route || 'Callao → Chincha' }}</p></div><button class="download-action" type="button" @click="printManifest"><i class="pi pi-download"></i> Descargar PDF</button></header>
    <div class="manifest-grid">
      <article class="document-preview">
        <strong>Acta de traslado {{ manifest.transferId }}</strong>
        <p>Carga: {{ manifest.cargo }} · 2–8 °C</p>
        <p>Recibido por: {{ manifest.recipient }}</p>
        <p>Fecha y hora: {{ manifest.sealedAt.replace(' · ', ' ') }}</p>
        <p>Temperatura máx.: {{ manifest.temperatureMax }} · aperturas: {{ manifest.openings }}</p>
      </article>
      <aside class="seal-panel"><h2>Sellado</h2><div class="seal-row"><strong>Estado</strong><span>Manifiesto sellado</span><b class="valid-badge">Válido</b></div><div class="seal-row"><strong>SHA-256</strong><span>{{ manifest.hash.slice(0, 4) }}…{{ manifest.hash.slice(-4) }}</span></div></aside>
    </div>
  </section>
  <div v-else class="loading-state">Cargando acta digital…</div>
</template>

<style scoped src="../styles/digital-records-view.css"></style>
