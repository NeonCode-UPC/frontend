import { defineStore } from 'pinia';
import { CustodyApi } from '../infrastructure/custody-api.js';
import { toCustodyTransfer, toDigitalAuditManifest } from '../infrastructure/custody.assembler.js';

const api = new CustodyApi();

export const useCustodyStore = defineStore('custody', {
  state: () => ({ transfers: [], manifests: [], auditEvents: [], loading: false, error: null, initialized: false }),
  getters: {
    closedCount: (state) => state.transfers.filter((item) => item.status === 'closed').length,
    inTransitCount: (state) => state.transfers.filter((item) => item.status === 'in-transit').length,
    exceptionCount: (state) => state.transfers.filter((item) => item.status === 'exception').length,
    findTransfer: (state) => (id) => state.transfers.find((item) => item.id === id)
  },
  actions: {
    prepareReception(id, recipient) {
      const transfer = this.findTransfer(id);
      if (!transfer) throw new Error('No se encontró el traslado.');
      transfer.prepareReception(recipient);
    },
    verifyReceptionCode(id, code) {
      const transfer = this.findTransfer(id);
      if (!transfer) throw new Error('No se encontró el traslado.');
      // The local prototype uses the OTP shown in the approved screen reference.
      transfer.verifyOtp(code, '307158');
      return transfer;
    },
    async confirmReception(id) {
      const transfer = this.findTransfer(id);
      if (!transfer) throw new Error('No se encontró el traslado.');
      const now = new Date();
      transfer.confirmReception({
        date: now.toLocaleDateString('es-PE'),
        time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      });
      const sealedAt = transfer.receivedAt;
      const canonicalManifest = JSON.stringify({
        transferId: transfer.id,
        sealedAt,
        recipient: transfer.recipient,
        temperatureMax: transfer.temperatureMax,
        openings: transfer.openings,
        cargo: transfer.cargo,
        events: transfer.events
      });
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalManifest));
      const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      this.manifests.unshift({
        id: `MAN-${transfer.id.slice(-4)}`,
        transferId: transfer.id,
        sealedAt,
        recipient: transfer.recipient,
        temperatureMax: transfer.temperatureMax,
        openings: transfer.openings,
        cargo: transfer.cargo,
        status: 'valid',
        hash
      });
      this.auditEvents.unshift({
        id: `AUD-${Date.now()}`,
        date: now.toLocaleDateString('es-PE'),
        time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        user: transfer.recipient,
        event: 'Recepción confirmada',
        resource: transfer.id
      });
      return transfer;
    },
    async load() {
      if (this.initialized || this.loading) return;
      this.loading = true;
      this.error = null;
      try {
        const [transfersResult, manifestsResult, auditEventsResult] = await Promise.all([
          api.getTransfers(),
          api.getManifests(),
          api.getAuditEvents()
        ]);
        this.transfers = transfersResult.data.map(toCustodyTransfer);
        this.manifests = manifestsResult.data.map(toDigitalAuditManifest);
        this.auditEvents = auditEventsResult.data;
        this.initialized = true;
      } catch {
        this.error = 'No se pudieron cargar los datos. Verifica que el servidor API esté activo e inténtalo de nuevo.';
      } finally {
        this.loading = false;
      }
    }
  }
});
