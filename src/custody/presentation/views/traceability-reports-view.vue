<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustodyStore } from '../../application/custody-store.js';

const route = useRoute();
const router = useRouter();
const store = useCustodyStore();
const selectedTransferId = ref('');
const includeTemperature = ref(true);
const includeOpenings = ref(true);
const includeTimes = ref(true);
const includeSeal = ref(true);
const isGenerating = ref(false);
const reportData = ref(null);
const viewError = ref('');
const filter = ref('all');
const reportsBasePath = computed(() => route.path.startsWith('/custody/reports') ? '/custody/reports' : '/reports');
const isRequest = computed(() => route.query.new === '1');
const selectedTransfer = computed(() => store.findTransfer(String(route.query.transfer || '')));
const closedTransfers = computed(() => store.transfers.filter((transfer) => ['closed', 'exception'].includes(transfer.status)));
const reports = computed(() => {
  const query = filter.value === 'pending' ? 'pending' : filter.value === 'generated' ? 'generated' : '';
  return store.transfers.filter((transfer) => {
    const generated = store.manifests.some((manifest) => manifest.transferId === transfer.id);
    return !query || (query === 'generated' ? generated : !generated);
  });
});
const temperaturePoints = computed(() => {
  const readings = reportData.value?.temperatureReadings || [];
  if (!readings.length) return '';
  return readings.map((reading, index) => {
    const x = readings.length === 1 ? 50 : 12 + (index / (readings.length - 1)) * 76;
    const value = Number(reading.temperatureCelsius ?? reading.TemperatureCelsius ?? 4);
    const y = 80 - ((value - 2) / 6) * 60;
    return `${x},${Math.max(12, Math.min(88, y))}`;
  }).join(' ');
});

onMounted(async () => {
  await store.load();
  if (!selectedTransferId.value) selectedTransferId.value = closedTransfers.value[0]?.id || '';
  if (route.query.transfer) loadReport(String(route.query.transfer));
});
watch(() => route.query.transfer, (id) => {
  if (id && reportData.value?.transfer?.id !== id) loadReport(String(id));
  if (!id) reportData.value = null;
});

async function loadReport(id) {
  viewError.value = '';
  try { reportData.value = await store.loadTraceabilityReport(id); }
  catch (error) { viewError.value = error.message; }
}
function openRequest() {
  reportData.value = null;
  viewError.value = '';
  selectedTransferId.value = closedTransfers.value[0]?.id || '';
  router.push({ path: reportsBasePath.value, query: { new: '1' } });
}
function openReport(id) { router.push({ path: reportsBasePath.value, query: { transfer: id } }); }
function cancelRequest() { router.push(reportsBasePath.value); }
async function generateReport() {
  if (!selectedTransferId.value) return;
  isGenerating.value = true;
  viewError.value = '';
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  try {
    reportData.value = await store.loadTraceabilityReport(selectedTransferId.value);
    router.replace({ path: reportsBasePath.value, query: { transfer: selectedTransferId.value } });
  } catch (error) {
    viewError.value = error.message;
  } finally { isGenerating.value = false; }
}
async function downloadPdf(id = selectedTransfer.value?.id) {
  try {
    const blob = await store.downloadTraceabilityReport(id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traceability-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) { viewError.value = error.message; }
}
function routeToCustody() { router.push('/custody'); }
</script>

<template>
  <base-screen
    :breadcrumb="route.query.transfer ? `Reportes / ${route.query.transfer}` : 'Reportes'"
    :title="route.query.transfer ? `Reporte ${route.query.transfer}` : isRequest ? 'Reporte de trazabilidad' : 'Reportes'"
    :subtitle="route.query.transfer ? 'Cumplimiento de cadena de frío' : isRequest ? 'Traslados finalizados' : 'Informes de trazabilidad por traslado'"
    :fluid="true"
  >
    <template #actions>
      <div v-if="!isRequest && !route.query.transfer" class="report-header-actions"><button v-if="route.path.startsWith('/custody')" class="report-secondary report-back" @click="routeToCustody"><i class="pi pi-arrow-left"></i> Custodia</button><button class="report-primary" @click="openRequest"><i class="pi pi-plus"></i> Nuevo reporte</button></div>
      <div v-else-if="route.query.transfer && reportData" class="report-header-actions"><button class="report-secondary report-back" @click="router.push(reportsBasePath.value)">Reportes</button><button class="report-primary" @click="downloadPdf()"><i class="pi pi-download"></i> Exportar PDF</button></div>
      <div v-else class="report-header-actions"><button class="report-secondary" @click="cancelRequest">Cancelar</button><button class="report-primary" :disabled="!selectedTransferId || isGenerating" @click="generateReport"><i class="pi pi-chart-line"></i> Generar reporte</button></div>
    </template>

    <div v-if="viewError" class="report-error" role="alert"><i class="pi pi-info-circle"></i>{{ viewError }}</div>

    <section v-if="isRequest && !isGenerating" class="report-request-layout">
      <article class="report-card report-select-card">
        <div class="report-card-heading"><div><span class="eyebrow">SOLICITUD</span><h2>Seleccionar traslado</h2><p>El reporte se genera cuando la cadena de custodia está cerrada.</p></div></div>
        <div v-if="closedTransfers.length" class="request-transfer-list">
          <label v-for="transfer in closedTransfers" :key="transfer.id" class="request-transfer" :class="{ selected: selectedTransferId === transfer.id }">
            <input v-model="selectedTransferId" type="radio" :value="transfer.id" name="traceability-transfer" />
            <span class="request-radio"></span>
            <span class="request-transfer-main"><strong>{{ transfer.id }}</strong><small>{{ transfer.route }}</small></span>
            <status-badge :status="transfer.status" :label="transfer.status === 'exception' ? 'Excursión' : 'Finalizado'" />
          </label>
        </div>
        <empty-state v-else icon="pi pi-inbox" title="No hay traslados finalizados" message="Cierra una recepción para poder generar un reporte de trazabilidad." />
      </article>
      <article class="report-card report-options-card">
        <span class="eyebrow">CONTENIDO DEL INFORME</span><h2>Información incluida</h2>
        <label class="report-option"><input v-model="includeTemperature" type="checkbox" /><span class="custom-check"></span><span>Curva de temperatura</span></label>
        <label class="report-option"><input v-model="includeOpenings" type="checkbox" /><span class="custom-check"></span><span>Aperturas de tapa</span></label>
        <label class="report-option"><input v-model="includeTimes" type="checkbox" /><span class="custom-check"></span><span>Tiempos de traslado</span></label>
        <label class="report-option"><input v-model="includeSeal" type="checkbox" /><span class="custom-check"></span><span>Sellado del documento</span></label>
        <button class="report-primary full" :disabled="!selectedTransferId || isGenerating" @click="generateReport"><i class="pi pi-chart-line"></i> Generar reporte</button>
      </article>
    </section>

    <section v-else-if="isGenerating" class="report-generating-card">
      <span class="progress-spinner"><i class="pi pi-spin pi-spinner"></i></span><h2>Generando reporte de auditoría...</h2>
      <div class="progress-track"><span></span></div>
      <ul><li><i class="pi pi-check-circle"></i> Curva de temperatura</li><li><i class="pi pi-check-circle"></i> Aperturas y tiempos de traslado</li><li><i class="pi pi-circle"></i> Sellado del documento</li></ul>
    </section>

    <section v-else-if="route.query.transfer && reportData" class="generated-report">
      <div class="report-success-banner"><i class="pi pi-check-circle"></i><span><strong>Traslado conforme</strong><small>Reporte generado con los registros de la cadena de custodia.</small></span></div>
      <div class="generated-grid">
        <article v-if="includeTemperature" class="report-card temperature-chart-card"><div class="report-card-heading"><div><span class="eyebrow">HISTORIAL TÉRMICO</span><h2>Curva de temperatura</h2></div><span class="chart-range">2 °C — 8 °C</span></div>
          <svg class="temperature-chart" viewBox="0 0 100 100" role="img" aria-label="Curva de temperatura del traslado"><line x1="12" y1="20" x2="88" y2="20" class="chart-limit"/><line x1="12" y1="80" x2="88" y2="80" class="chart-limit"/><polyline v-if="temperaturePoints" :points="temperaturePoints" class="chart-line"/><text x="1" y="22">8°</text><text x="1" y="82">2°</text></svg>
        </article>
        <div class="report-metrics"><article v-if="includeTemperature" class="report-card metric-tile"><small>Temp. media</small><strong>{{ reportData.manifest?.averageTemperatureCelsius ?? '—' }} °C</strong></article><article v-if="includeOpenings" class="report-card metric-tile"><small>Aperturas</small><strong>{{ reportData.transfer?.openings ?? 0 }}</strong></article><article v-if="includeTimes" class="report-card metric-tile"><small>Traslado</small><strong>{{ reportData.transfer?.departureAt || '—' }}</strong></article><article class="report-card metric-tile"><small>Estado</small><strong>{{ reportData.manifest?.minsaComplianceVerified ? 'Conforme' : 'Revisado' }}</strong></article></div>
      </div>
      <article class="report-card report-details"><span class="eyebrow">TRAZABILIDAD</span><h2>{{ reportData.transfer?.id }} · {{ reportData.transfer?.route }}</h2><p>{{ reportData.transfer?.cargo }} · {{ reportData.transfer?.smartBox }} · Responsable: {{ reportData.transfer?.recipient || '—' }}</p><div v-if="includeSeal" class="sealed-hash"><span>Manifiesto sellado</span><code>{{ reportData.manifest?.hash || 'Sin manifiesto' }}</code></div></article>
    </section>

    <section v-else class="reports-list-page">
      <div class="report-list-heading"><div><span class="eyebrow">TRAZABILIDAD</span><h2>Informes de trazabilidad por traslado</h2></div><div class="report-filters"><button :class="{ active: filter === 'all' }" @click="filter = 'all'">Todos {{ store.transfers.length }}</button><button :class="{ active: filter === 'generated' }" @click="filter = 'generated'">Generados {{ store.manifests.length }}</button><button :class="{ active: filter === 'pending' }" @click="filter = 'pending'">Pendientes {{ Math.max(0, store.transfers.length - store.manifests.length) }}</button></div></div>
      <div class="report-table-wrap"><table class="report-table"><thead><tr><th>TRASLADO</th><th>RUTA</th><th>FECHA</th><th>RESULTADO</th><th>REPORTE</th><th>ACCIONES</th></tr></thead><tbody>
        <tr v-for="transfer in reports" :key="transfer.id"><td><strong>{{ transfer.id }}</strong></td><td>{{ transfer.route }}</td><td>{{ transfer.receivedAt?.split('·')[0]?.trim() || transfer.departureAt?.split('·')[0]?.trim() || '—' }}</td><td><span class="result-chip" :class="transfer.status === 'exception' ? 'danger' : transfer.status === 'in-transit' ? 'pending' : 'success'">{{ transfer.status === 'exception' ? 'Excursión' : transfer.status === 'in-transit' ? 'En curso' : 'Conforme' }}</span></td><td><span class="result-chip" :class="store.manifests.some(item => item.transferId === transfer.id) ? 'success' : 'pending'">{{ store.manifests.some(item => item.transferId === transfer.id) ? 'Generado' : 'Pendiente' }}</span></td><td class="report-row-actions"><button class="tiny-action" @click="openReport(transfer.id)">Ver</button><button class="tiny-action" :disabled="!['closed','exception'].includes(transfer.status)" @click="downloadPdf(transfer.id)"><i class="pi pi-download"></i> Exportar PDF</button></td></tr>
      </tbody></table><p v-if="!reports.length" class="empty-reports">No hay reportes en esta categoría.</p></div>
    </section>
  </base-screen>
</template>

<style scoped src="../styles/traceability-reports-view.css"></style>
