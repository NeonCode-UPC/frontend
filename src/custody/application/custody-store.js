import { defineStore } from 'pinia';
import { CustodyApi } from '../infrastructure/custody-api.js';
import { toCustodyTransfer, toDigitalAuditManifest } from '../infrastructure/custody.assembler.js';
import { auditSeed, custodySeed, manifestSeed } from './custody-seed.js';

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
      if (this.initialized) return;
      this.loading = true;
      this.error = null;
      try {
        const [transfersResult, manifestsResult] = await Promise.allSettled([api.getTransfers(), api.getManifests()]);
        if (transfersResult.status === 'rejected' || manifestsResult.status === 'rejected') {
          this.error = 'No se pudo conectar con el mock API. Se muestran datos de demostración.';
        }
        const transfers = transfersResult.status === 'fulfilled' ? transfersResult.value.data : [];
        const manifests = manifestsResult.status === 'fulfilled' ? manifestsResult.value.data : [];
        this.transfers = (transfers.length ? transfers : custodySeed).map(toCustodyTransfer);
        this.manifests = (manifests.length ? manifests : manifestSeed).map(toDigitalAuditManifest);
        this.auditEvents = auditSeed;
        this.initialized = true;
      } catch (error) {
        this.error = 'No se pudieron cargar los registros de custodia.';
        this.transfers = custodySeed.map(toCustodyTransfer);
        this.manifests = manifestSeed.map(toDigitalAuditManifest);
      } finally {
        this.loading = false;
      }
    }
  }
});
