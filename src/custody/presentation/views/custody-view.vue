<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useCustodyStore } from '../../application/custody-store.js';

const store = useCustodyStore();
const route = useRoute();
const router = useRouter();
const { searchQuery, configureHeader } = useLayoutHeader();
const selectedId = computed(() => route.query.transfer || 'TR-0417');
const selectedTransfer = computed(() => store.findTransfer(selectedId.value));
const receptionTransfer = ref(null);
const recipientName = ref('Dr. Jorge Paredes Lino');
const recipientNotes = ref('');
const otpCode = ref('');
const otpError = ref('');
const otpAttempts = ref(0);
const otpVerified = ref(false);
const receptionStep = ref('');
const receptionBusy = ref(false);
const viewMode = computed(() => route.query.mode === 'chain' ? 'chain' : 'incoming');

onMounted(() => {
  configureHeader({ placeholder: 'Filtrar por ruta, estado o SmartBox', visible: true });
  store.load();
});

const filteredTransfers = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es');
  return store.transfers.filter((item) => !query || [item.id, item.route, item.recipient, item.cargo, item.smartBox].some((value) => value?.toLocaleLowerCase('es').includes(query)));
});
const incomingTransfers = computed(() => filteredTransfers.value.filter((transfer) => transfer.status !== 'exception'));
const pendingReceptionCount = computed(() => incomingTransfers.value.filter((transfer) => transfer.status !== 'closed').length);
const statusLabel = (status) => ({ closed: 'Entregado', 'in-transit': 'En tránsito', 'pending-otp': 'Verificación OTP', 'otp-verified': 'OTP verificado', exception: 'Cerrada con excursión' }[status] || status);
const timePart = (value) => value?.split('·')[1]?.trim() || '—';
const openTransfer = (id) => router.push({ path: '/custody', query: { transfer: id } });
const openChain = () => router.push({ path: '/custody', query: { mode: 'chain' } });
const openReception = (transfer, step = 'confirm') => {
  receptionTransfer.value = transfer;
  receptionStep.value = step;
  recipientName.value = transfer.recipient || 'Dr. Jorge Paredes Lino';
  recipientNotes.value = '';
  otpCode.value = '';
  otpError.value = '';
  otpVerified.value = transfer.isOtpVerified;
  otpAttempts.value = transfer.otpAttempts || 0;
};
const prepareReception = async () => {
  otpError.value = '';
  receptionBusy.value = true;
  try {
    receptionTransfer.value = await store.prepareReception(receptionTransfer.value.id, recipientName.value);
    otpCode.value = store.developmentOtp || '';
    otpAttempts.value = receptionTransfer.value.otpAttempts || 0;
    receptionStep.value = 'otp';
  } catch (error) {
    otpError.value = error.message;
  } finally {
    receptionBusy.value = false;
  }
};
const verifyOtp = async () => {
  otpError.value = '';
  receptionBusy.value = true;
  try {
    await store.verifyReceptionCode(receptionTransfer.value.id, otpCode.value);
    otpVerified.value = true;
    otpAttempts.value = 0;
  } catch (error) {
    otpAttempts.value = receptionTransfer.value.otpAttempts ?? otpAttempts.value + 1;
    otpError.value = `${error.message}${otpAttempts.value < 3 ? ` Te quedan ${3 - otpAttempts.value} intentos.` : ' Solicita asistencia para continuar.'}`;
  } finally {
    receptionBusy.value = false;
  }
};
const closeReception = async () => {
  if (!otpVerified.value) return;
  otpError.value = '';
  receptionBusy.value = true;
  try {
    const completed = await store.confirmReception(receptionTransfer.value.id, { recipientNotes: recipientNotes.value || null });
    receptionTransfer.value = completed;
    receptionStep.value = 'closed';
  } catch (error) {
    otpError.value = error.message;
  } finally {
    receptionBusy.value = false;
  }
};
const viewReport = () => router.push({ path: '/custody/reports', query: { transfer: receptionTransfer.value.id } });
</script>

<template>
  <base-screen
    :breadcrumb="viewMode === 'chain' ? 'Cadena de custodia' : 'Cadena de custodia'"
    :title="receptionTransfer ? (receptionStep === 'closed' ? 'Recepción confirmada' : receptionStep === 'confirm' ? 'Confirmar recepción' : 'Verificar código de entrega') : viewMode === 'chain' ? 'Cadena de custodia' : 'Envíos entrantes'"
    :subtitle="receptionTransfer ? `${receptionTransfer.id} · ${receptionTransfer.route}` : viewMode === 'chain' ? 'Estado del sellado por traslado' : 'Hospital Regional Goyeneche · recepciones pendientes'"
    search-placeholder="Filtrar por ruta, estado o SmartBox"
    :fluid="true"
  >
    <template #actions>
      <div v-if="receptionTransfer && receptionStep !== 'closed'" class="reception-page-actions">
        <button class="reception-cancel" @click="receptionTransfer = null">Cancelar</button>
        <button v-if="receptionStep === 'confirm'" class="primary-action" :disabled="!recipientName.trim() || receptionBusy" @click="prepareReception"><i class="pi pi-check"></i> Confirmar recepción</button>
      </div>
      <nav v-else-if="!receptionTransfer" class="custody-shortcuts" aria-label="Navegación de trazabilidad">
        <button class="shortcut-current" @click="router.push('/custody')">Recepciones</button>
        <button @click="router.push('/custody/records')">Actas digitales</button>
        <button @click="router.push('/custody/reports')">Reportes</button>
        <button @click="router.push('/custody/audit')">Auditoría</button>
      </nav>
    </template>

    <div v-if="!receptionTransfer" class="custody-page">
      <p v-if="store.error" class="custody-notice" role="alert">
        <i class="pi pi-info-circle"></i>{{ store.error }}
        <button type="button" @click="store.load()">Reintentar</button>
      </p>

      <template v-if="viewMode === 'incoming'">
        <header class="custody-section-heading">
          <div>
            <p class="eyebrow">CADENA DE CUSTODIA</p>
            <h2>Envíos entrantes</h2>
            <p class="section-caption">Prepara la recepción y confirma la identidad del receptor.</p>
          </div>
          <span class="count-pill">{{ pendingReceptionCount }} pendientes</span>
        </header>

        <section class="incoming-list" aria-label="Envíos entrantes">
          <div v-if="store.loading" class="list-loading"><i class="pi pi-spin pi-spinner"></i> Cargando traslados</div>
          <article v-for="transfer in incomingTransfers" :key="transfer.id" class="incoming-row" :class="{ 'incoming-row--selected': transfer.id === selectedId }" @click="openTransfer(transfer.id)">
            <div class="incoming-main">
              <strong>{{ transfer.id }}</strong>
              <span>{{ transfer.cargo }} · salida {{ timePart(transfer.departureAt) }}</span>
            </div>
            <span class="temperature-indicator"><i></i>{{ transfer.status === 'exception' ? 'Revisar' : 'Estable' }}</span>
            <status-badge :status="transfer.status" :label="statusLabel(transfer.status)" />
            <button v-if="transfer.status !== 'closed'" class="outline-action" :disabled="receptionBusy" @click.stop="openReception(transfer, transfer.status === 'pending-otp' || transfer.status === 'otp-verified' ? 'otp' : 'confirm')">
              {{ transfer.status === 'pending-otp' ? 'Continuar recepción' : 'Preparar recepción' }}
            </button>
            <button v-else class="outline-action" @click.stop="router.push({ name: 'custody-records', query: { transfer: transfer.id } })">Ver acta</button>
          </article>
          <div v-if="!store.loading && incomingTransfers.length === 0" class="empty-list">No hay recepciones pendientes.</div>
        </section>

        <section v-if="selectedTransfer" class="transfer-summary" aria-label="Resumen del traslado seleccionado">
          <div class="summary-route"><span class="route-dot"></span><div><strong>{{ selectedTransfer.id }} · {{ selectedTransfer.route }}</strong><small>Condición durante el viaje · {{ selectedTransfer.cargo }}</small></div></div>
          <div class="summary-stat"><strong>{{ selectedTransfer.temperatureMax }}</strong><small>Temperatura</small></div>
          <div class="summary-stat"><strong>{{ timePart(selectedTransfer.departureAt) }}</strong><small>Salida</small></div>
          <div class="summary-stat"><strong>{{ selectedTransfer.openings }}</strong><small>Aperturas</small></div>
          <div class="summary-stat"><strong>{{ selectedTransfer.smartBox }}</strong><small>SmartBox</small></div>
        </section>
        <button class="text-link chain-link" type="button" @click="openChain">Ver cadena de custodia completa <i class="pi pi-arrow-right"></i></button>
      </template>

      <section v-else class="chain-table-card">
        <div class="table-heading"><div><p class="eyebrow">TRAZABILIDAD</p><h2>Traslados y estado del sellado</h2></div><button class="outline-action" @click="router.push('/custody')"><i class="pi pi-arrow-left"></i> Envíos entrantes</button></div>
        <div class="chain-table-scroll">
          <table class="chain-table">
            <thead><tr><th>TRASLADO</th><th>SALIDA</th><th>RECEPCIÓN</th><th>RESPONSABLE</th><th>ESTADO</th><th></th></tr></thead>
            <tbody>
              <tr v-for="transfer in filteredTransfers" :key="transfer.id" @click="openTransfer(transfer.id)">
                <td><strong>{{ transfer.id }}</strong></td><td>{{ timePart(transfer.departureAt) }}</td><td>{{ timePart(transfer.receivedAt) }}</td><td>{{ transfer.recipient || '—' }}</td>
                <td><status-badge :status="transfer.status" :label="statusLabel(transfer.status)" /></td>
                <td><button class="table-open" :aria-label="`Ver ${transfer.id}`" @click.stop="openTransfer(transfer.id)"><i class="pi pi-chevron-right"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>

    <div v-if="receptionTransfer" class="reception-backdrop">
      <section class="reception-dialog" :class="{ 'reception-dialog--success': receptionStep === 'closed' }" role="dialog" aria-modal="true" aria-labelledby="reception-title">
        <template v-if="receptionStep === 'closed'">
          <button class="dialog-close" aria-label="Cerrar" @click="receptionTransfer = null"><i class="pi pi-times"></i></button>
          <div class="closed-check"><i class="pi pi-check"></i></div>
          <h2 id="reception-title">Custodia cerrada</h2>
          <p class="success-caption">Registro sellado con fecha, hora y responsable.</p>
          <div class="receipt-event"><i class="pi pi-check-circle"></i><span><strong>Recibido por {{ receptionTransfer.recipient }}</strong><small>{{ receptionTransfer.receivedAt }}</small></span></div>
          <div class="receipt-event"><i class="pi pi-check-circle"></i><span><strong>Entrega desde {{ receptionTransfer.smartBox }}</strong><small>Recepción validada por código OTP</small></span></div>
          <button class="primary-action full-action" @click="viewReport">Ver reporte</button>
        </template>

        <template v-else>
          <header class="dialog-heading">
            <div><p class="reception-breadcrumb">Cadena de custodia / <strong>{{ receptionTransfer.id }}</strong></p><h2 id="reception-title">{{ receptionStep === 'confirm' ? 'Confirmar recepción' : 'Verificar código de entrega' }}</h2><p>{{ receptionTransfer.id }} · llegada a {{ receptionTransfer.route.split('→').at(-1).trim() }}</p></div>
            <button class="reception-cancel" @click="receptionTransfer = null">Cancelar</button>
          </header>
          <div v-if="otpError" class="otp-alert" role="alert"><i class="pi pi-shield"></i><div><strong>Código de verificación incorrecto</strong><span>{{ otpError }}</span></div></div>
          <div v-if="receptionStep === 'confirm'" class="reception-grid">
            <article class="reception-card cargo-condition"><h3>Condición durante el viaje</h3><dl>
              <div><dt>Temperatura máx.</dt><dd>{{ receptionTransfer.temperatureMax }} <span class="condition-ok">En rango</span></dd></div>
              <div><dt>Aperturas</dt><dd>{{ receptionTransfer.openings }} <span class="condition-ok">Sin aperturas</span></dd></div>
              <div><dt>Peso</dt><dd>— <span class="condition-neutral">Sin dato</span></dd></div>
              <div><dt>Geocerca</dt><dd>Dentro del destino <span class="condition-ok">OK</span></dd></div>
            </dl></article>
            <article class="reception-card"><label class="field-label" for="recipient-name">RESPONSABLE DE RECEPCIÓN</label><input id="recipient-name" v-model="recipientName" class="recipient-input" />
              <label class="field-label otp-label" for="recipient-notes">OBSERVACIONES</label><textarea id="recipient-notes" v-model="recipientNotes" class="notes-input" placeholder="Sin novedades" rows="2"></textarea>
            </article>
          </div>
          <div v-else class="reception-grid">
            <article class="reception-card otp-card"><label class="field-label" for="otp-code">Código de 6 dígitos del receptor</label>
              <input id="otp-code" v-model="otpCode" class="otp-input" :class="{ 'otp-input--error': otpError, 'otp-input--valid': otpVerified }" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" :disabled="otpVerified || otpAttempts >= 3 || receptionBusy" @input="otpCode = otpCode.replace(/\D/g, '').slice(0, 6)" />
              <label class="field-label otp-label" for="recipient-name-otp">RECEPTOR</label><input id="recipient-name-otp" v-model="recipientName" disabled class="recipient-input" />
              <button v-if="!otpVerified" class="primary-action full-action" :disabled="otpCode.length !== 6 || otpAttempts >= 3 || receptionBusy" @click="verifyOtp"><i v-if="receptionBusy" class="pi pi-spin pi-spinner"></i><i v-else class="pi pi-shield"></i> Verificar código</button>
              <div v-else class="otp-success"><i class="pi pi-check-circle"></i> Identidad verificada</div>
              <button v-if="otpVerified" class="primary-action full-action" :disabled="receptionBusy" @click="closeReception">Confirmar recepción y cerrar custodia</button>
            </article>
            <article class="reception-card cargo-condition"><h3>Condición de la carga</h3><dl>
              <div><dt>Temperatura máx.</dt><dd>{{ receptionTransfer.temperatureMax }} <span class="condition-ok">En rango</span></dd></div>
              <div><dt>Aperturas</dt><dd>{{ receptionTransfer.openings }} <span class="condition-ok">Sin aperturas</span></dd></div>
              <div><dt>Peso</dt><dd>— <span class="condition-neutral">Sin dato</span></dd></div>
              <div><dt>Tapa</dt><dd>{{ otpVerified ? 'Desbloqueada' : 'Se desbloquea al verificar' }}</dd></div>
            </dl></article>
          </div>
        </template>
      </section>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/custody-view.css"></style>
