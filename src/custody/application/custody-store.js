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
