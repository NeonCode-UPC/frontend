<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutHeader } from '../../../shared/composables/use-layout-header.js';
import { useCustodyStore } from '../../application/custody-store.js';

const store = useCustodyStore();
const route = useRoute();
const router = useRouter();
const { searchQuery, configureHeader } = useLayoutHeader();
const selectedId = computed(() => route.query.transfer || '');
const receptionTransfer = ref(null);
const recipientName = ref('Dr. Jorge Paredes Lino');
const otpCode = ref('');
const otpError = ref('');
const otpAttempts = ref(0);
const otpVerified = ref(false);

onMounted(() => {
  configureHeader({ placeholder: 'Filtrar por código de custodia...', visible: true });
  store.load();
});

const filteredTransfers = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es');
  return store.transfers.filter((item) => !query || [item.id, item.route, item.recipient, item.cargo].some((value) => value?.toLocaleLowerCase('es').includes(query)));
});
const selectedTransfer = computed(() => store.findTransfer(selectedId.value));
const openTransfer = (id) => router.push({ path: '/custody', query: { transfer: id } });
const statusLabel = (status) => ({ closed: 'Cerrada', 'in-transit': 'En tránsito', exception: 'Cerrada con excursión' }[status] || status);
const receivedTime = (transfer) => transfer.receivedAt?.split('·')[1]?.trim() || '—';
const beginReception = (transfer) => {
  otpError.value = '';
  otpCode.value = '';
  otpAttempts.value = 0;
  otpVerified.value = false;
  receptionTransfer.value = transfer;
  recipientName.value = transfer.recipient || 'Dr. Jorge Paredes Lino';
  if (transfer.canPrepareReception) store.prepareReception(transfer.id, recipientName.value);
};
const verifyOtp = () => {
  otpError.value = '';
  try {
    store.verifyReceptionCode(receptionTransfer.value.id, otpCode.value);
    otpVerified.value = true;
  } catch (error) {
    otpAttempts.value += 1;
    otpError.value = `${error.message}${otpAttempts.value < 3 ? ` Te quedan ${3 - otpAttempts.value} intentos.` : ' Solicita un nuevo código.'}`;
  }
};
const closeReception = () => {
  if (!otpVerified.value) return;
  store.confirmReception(receptionTransfer.value.id);
  receptionTransfer.value = null;
  router.replace({ path: '/custody', query: { transfer: selectedId.value || 'TR-0417' } });
};
</script>

<template>
  <base-screen
    breadcrumb="Custodia"
    title="Cadena de custodia"
    subtitle="Estado del sellado y trazabilidad digital por traslado"
    search-placeholder="Filtrar por código de custodia..."
    :fluid="true"
  >
    <div class="custody-page">
      <p v-if="store.error" class="inline-notice">
        <i class="pi pi-info-circle"></i>{{ store.error }}
        <button type="button" @click="store.load()">Reintentar</button>
      </p>

      <app-data-table
        :value="filteredTransfers"
        :loading="store.loading"
        min-width="45rem"
        empty-title="No hay traslados que coincidan con la búsqueda"
        empty-message="Intenta con otro código de seguimiento o filtro."
        @row-click="event => openTransfer(event.data.id)"
      >
        <pv-column field="id" header="TRASLADO">
          <template #body="{ data }">
            <strong class="text-main cursor-pointer">{{ data.id }}</strong>
          </template>
        </pv-column>

        <pv-column field="departureAt" header="SALIDA">
          <template #body="{ data }">
            <span class="text-secondary text-sm">{{ data.departureAt?.split('·')[1]?.trim() }}</span>
          </template>
        </pv-column>

        <pv-column field="receivedAt" header="RECEPCIÓN">
          <template #body="{ data }">
            <span class="text-secondary text-sm">{{ receivedTime(data) }}</span>
          </template>
        </pv-column>

        <pv-column field="recipient" header="RESPONSABLE">
          <template #body="{ data }">
            <span class="text-secondary text-sm">{{ data.recipient || '—' }}</span>
          </template>
        </pv-column>

        <pv-column field="status" header="ESTADO">
          <template #body="{ data }">
            <status-badge :status="data.status" :label="statusLabel(data.status)" />
          </template>
        </pv-column>

        <pv-column header="ACCIÓN">
          <template #body="{ data }">
            <button
              v-if="data.status === 'in-transit' || data.status === 'pending-otp'"
              class="prepare-reception"
              type="button"
              @click.stop="beginReception(data)"
            >
              {{ data.status === 'pending-otp' ? 'Continuar recepción' : 'Preparar recepción' }}
            </button>
            <button v-else class="prepare-reception prepare-reception--quiet" type="button" @click.stop="router.push({ name: 'custody-records', query: { transfer: data.id } })">
              Ver acta
            </button>
          </template>
        </pv-column>
      </app-data-table>

      <section v-if="receptionTransfer" class="reception-panel" aria-labelledby="reception-title">
        <header class="reception-heading">
          <div>
            <p class="reception-breadcrumb">Cadena de custodia / {{ receptionTransfer.id }}</p>
            <h2 id="reception-title">Verificar código de entrega</h2>
            <p>{{ receptionTransfer.id }} · {{ receptionTransfer.route }}</p>
          </div>
          <button class="reception-cancel" type="button" @click="receptionTransfer = null">Cancelar</button>
        </header>

        <div v-if="otpError" class="otp-alert" role="alert">
          <i class="pi pi-shield"></i>
          <div><strong>Código de verificación incorrecto</strong><span>{{ otpError }}</span></div>
        </div>

        <div class="reception-grid">
          <article class="reception-card">
            <label class="field-label" for="recipient-name">RESPONSABLE DE RECEPCIÓN</label>
            <input id="recipient-name" v-model="recipientName" :disabled="receptionTransfer.isAwaitingOtp" class="recipient-input" />
            <label class="field-label otp-label" for="otp-code">Código de 6 dígitos del receptor</label>
            <input
              id="otp-code"
              v-model="otpCode"
              class="otp-input"
              :class="{ 'otp-input--error': otpError, 'otp-input--valid': otpVerified }"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="000000"
              :disabled="otpVerified || otpAttempts >= 3"
              @input="otpCode = otpCode.replace(/\D/g, '').slice(0, 6)"
            />
            <button v-if="!otpVerified" class="verify-otp" type="button" :disabled="otpCode.length !== 6 || otpAttempts >= 3" @click="verifyOtp">
              Verificar código
            </button>
            <div v-else class="otp-success"><i class="pi pi-check-circle"></i> Identidad verificada</div>
            <button v-if="otpVerified" class="verify-otp close-custody" type="button" @click="closeReception">Confirmar recepción y cerrar custodia</button>
          </article>

          <article class="reception-card cargo-condition">
            <h3>Condición de la carga</h3>
            <dl>
              <div><dt>Temperatura máx.</dt><dd>{{ receptionTransfer.temperatureMax }} <span class="condition-ok">En rango</span></dd></div>
              <div><dt>Aperturas</dt><dd>{{ receptionTransfer.openings }} <span class="condition-ok">Sin aperturas</span></dd></div>
              <div><dt>Peso</dt><dd>18,4 kg <span class="condition-ok">Estable</span></dd></div>
              <div><dt>Tapa</dt><dd>{{ otpVerified ? 'Desbloqueada' : 'Se desbloquea al verificar' }}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <content-card
        v-if="route.query.transfer && selectedTransfer"
        class="timeline-panel"
        padding="p-4"
      >
        <template #header>
          <div>
            <h2 class="text-base md:text-lg font-bold text-main m-0">
              {{ selectedTransfer.id }} · {{ selectedTransfer.route }}
            </h2>
            <p class="text-xs text-muted m-0 mt-1">
              {{ selectedTransfer.cargo }} · {{ selectedTransfer.smartBox }}
            </p>
          </div>
        </template>
        <template #header-actions>
          <status-badge :status="selectedTransfer.status" :label="statusLabel(selectedTransfer.status)" />
        </template>

        <app-timeline
          :steps="(selectedTransfer.events || []).map(ev => ({
            name: ev.title,
            detail: ev.detail,
            time: `${ev.date} · ${ev.time}`,
            type: ev.type === 'warning' ? 'alert' : ev.type === 'success' ? 'success' : 'checkpoint'
          }))"
        />
      </content-card>
    </div>
  </base-screen>
</template>

<style scoped src="../styles/custody-view.css"></style>
