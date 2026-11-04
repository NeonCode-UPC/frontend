<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustodyStore } from '../../application/custody-store.js';

const route = useRoute();
const router = useRouter();
const store = useCustodyStore();
const downloadError = ref('');
onMounted(() => store.load());
const manifest = computed(() => route.query.transfer ? store.manifests.find((item) => item.transferId === route.query.transfer) || null : null);
const transfer = computed(() => store.findTransfer(manifest.value?.transferId));
const openManifest = (id) => router.push({ name: 'custody-records', query: { transfer: id } });
const downloadManifest = async () => {
  if (!manifest.value) return;
  downloadError.value = '';
  try {
    const blob = await store.downloadTraceabilityReport(manifest.value.transferId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traceability-${manifest.value.transferId}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { downloadError.value = error.message; }
};
</script>

<template>
  <base-screen
    :breadcrumb="manifest ? `Actas digitales / ${manifest.transferId}` : 'Actas digitales'"
    :title="manifest ? `Acta digital ${manifest.transferId}` : 'Actas digitales'"
    :subtitle="manifest ? transfer?.route : 'Manifiestos sellados e inmutables por traslado'"
    :fluid="true"
  >
    <template #actions>
      <button v-if="manifest" class="manifest-secondary" @click="router.push({ name: 'custody-records' })"><i class="pi pi-arrow-left"></i> Todas las actas</button>
      <button v-if="manifest" class="manifest-primary" @click="downloadManifest"><i class="pi pi-download"></i> Descargar PDF</button>
    </template>

    <p v-if="downloadError" class="manifest-error" role="alert">{{ downloadError }}</p>

    <section v-if="!manifest" class="manifest-list-page">
      <div v-if="store.loading" class="manifest-loading"><i class="pi pi-spin pi-spinner"></i> Cargando actas</div>
      <div v-else-if="store.manifests.length" class="manifest-list">
        <article v-for="item in store.manifests" :key="item.id" class="manifest-list-row" @click="openManifest(item.transferId)">
          <div class="manifest-list-id"><strong>{{ item.transferId }}</strong><small>{{ store.findTransfer(item.transferId)?.route || item.cargo }}</small></div>
          <span class="manifest-status"><i></i>{{ item.status === 'valid' ? 'Válido' : 'Revisar' }}</span>
          <span class="manifest-date">{{ item.sealedAt }}</span>
          <button class="manifest-secondary" @click.stop="openManifest(item.transferId)">Ver acta <i class="pi pi-arrow-right"></i></button>
        </article>
      </div>
      <div v-else class="manifest-empty"><i class="pi pi-file"></i><strong>No hay actas digitales</strong><span>{{ store.error || 'Al cerrar una recepción se generará su manifiesto sellado.' }}</span></div>
    </section>

    <section v-else-if="manifest" class="manifest-detail-layout">
      <article class="manifest-document-card">
        <div class="document-heading"><span class="eyebrow">ACTA DE TRASLADO</span><h2>Acta digital {{ manifest.transferId }}</h2><p>{{ transfer?.route }}</p></div>
        <div class="document-data">
          <div><strong>Carga</strong><span>{{ manifest.cargo.toLowerCase() }} · {{ transfer?.temperatureRange || '2–8 °C' }}</span></div>
          <div><strong>Recibido por</strong><span>{{ manifest.recipient }}</span></div>
          <div><strong>Fecha y hora</strong><span>{{ manifest.sealedAt.replace(' · ', ' ') }}</span></div>
          <div><strong>Temperatura máx.</strong><span>{{ manifest.temperatureMax }} · aperturas: {{ manifest.openings }}</span></div>
        </div>
        <div class="manifest-document-footer"><i class="pi pi-shield"></i> Registro de custodia con sello digital</div>
      </article>
      <aside class="manifest-seal-card">
        <span class="eyebrow">INTEGRIDAD DOCUMENTAL</span><h2>Sellado</h2>
        <div class="seal-state"><span>Estado</span><strong class="manifest-status"><i></i>{{ manifest.status === 'valid' ? 'Válido' : 'Revisar' }}</strong><small>Manifiesto sellado</small></div>
        <div class="seal-hash"><span>SHA-256</span><code>{{ manifest.hash }}</code></div>
        <p class="immutable-note"><i class="pi pi-lock"></i> Este manifiesto es inmutable.</p>
      </aside>
    </section>
  </base-screen>
</template>

<style scoped src="../styles/digital-records-view.css"></style>
