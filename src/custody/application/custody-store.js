import { defineStore } from 'pinia';
import { CustodyApi } from '../infrastructure/custody-api.js';
import { toCustodyTransfer, toDigitalAuditManifest } from '../infrastructure/custody.assembler.js';

const api = new CustodyApi();
const messageFrom = (error) => error.response?.data?.message || error.message || 'No se pudo completar la operación.';

export const useCustodyStore = defineStore('custody', {
  state: () => ({
    transfers: [],
    manifests: [],
    auditEvents: [],
    selectedAudit: null,
    selectedReport: null,
    developmentOtp: null,
    loading: false,
    error: null,
    initialized: false
  }),
  getters: {
    closedCount: (state) => state.transfers.filter((item) => item.status === 'closed').length,
    inTransitCount: (state) => state.transfers.filter((item) => item.status === 'in-transit').length,
    exceptionCount: (state) => state.transfers.filter((item) => item.status === 'exception').length,
    findTransfer: (state) => (id) => state.transfers.find((item) => item.id === id)
  },
  actions: {
    applyTransfer(data) {
      const current = this.findTransfer(data.id);
      const updated = toCustodyTransfer(data);
      if (current) Object.assign(current, updated);
      else this.transfers.unshift(updated);
      return current || updated;
    },
    async prepareReception(id, recipient) {
      try {
        const { data } = await api.prepareReception(id, {
          recipient,
          insideDestinationGeofence: true
        });
        this.developmentOtp = data.developmentCode || null;
        return this.applyTransfer(data.transfer);
      } catch (error) {
        throw new Error(messageFrom(error));
      }
    },
    async verifyReceptionCode(id, code) {
      try {
        const { data } = await api.verifyOtp(id, code);
        const transfer = this.findTransfer(id);
        if (transfer) {
          transfer.status = data.status;
          transfer.otpAttempts = data.attempts;
          transfer.otpVerified = true;
        }
        if (!data.verified) {
          if (transfer) transfer.otpVerified = false;
          throw new Error(data.message || 'Código incorrecto.');
        }
        return transfer;
      } catch (error) {
        throw new Error(messageFrom(error));
      }
    },
    async confirmReception(id, { recipientNotes = null, hasUnresolvedCriticalAlerts = false } = {}) {
      try {
        const { data } = await api.acceptReception(id, { recipientNotes, hasUnresolvedCriticalAlerts });
        const transfer = this.applyTransfer(data.transfer);
        const manifest = toDigitalAuditManifest(data.manifest);
        this.manifests = [manifest, ...this.manifests.filter((item) => item.transferId !== manifest.transferId)];
        const { data: events } = await api.getAuditEvents();
        this.auditEvents = events;
        this.developmentOtp = null;
        return transfer;
      } catch (error) {
        throw new Error(messageFrom(error));
      }
    },
    async downloadTraceabilityReport(id) {
      try {
        const { data } = await api.getTraceabilityReportPdf(id);
        return data;
      } catch (error) {
        throw new Error(messageFrom(error));
      }
    },
    async loadTransferAudit(id) {
      try {
        const { data } = await api.getTransferAudit(id);
        this.selectedAudit = data;
        return data;
      } catch (error) {
        throw new Error(messageFrom(error));
      }
    },
    async loadTraceabilityReport(id) {
      try {
        const { data } = await api.getTraceabilityReport(id);
        this.selectedReport = data;
        return data;
      } catch (error) {
        throw new Error(messageFrom(error));
      }
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
      } catch (error) {
        this.error = messageFrom(error);
      } finally {
        this.loading = false;
      }
    }
  }
});
