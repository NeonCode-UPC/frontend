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
      if (!transfer?.isAwaitingOtp) throw new Error('Prepara la recepción antes de verificar el código.');
      if (!/^\d{6}$/.test(code)) throw new Error('Ingresa los 6 dígitos del código.');
      // The local prototype uses the OTP shown in the approved screen reference.
      if (code !== '307158') throw new Error('Código incorrecto.');
      const now = new Date();
      transfer.confirmReception({
        date: now.toLocaleDateString('es-PE'),
        time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
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
