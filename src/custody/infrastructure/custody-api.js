import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const baseApi = new BaseApi(import.meta.env.VITE_CUSTODY_API_URL || 'http://localhost:5261');

export class CustodyApi {
  constructor() {
    this.transfers = new BaseEndpoint(baseApi, '/api/v1/custody-transfers');
    this.manifests = new BaseEndpoint(baseApi, '/api/v1/digital-audit-manifests');
  }

  getTransfers() { return this.transfers.getAll(); }
  getManifests() { return this.manifests.getAll(); }
  getAuditEvents() { return baseApi.http.get('/api/v1/audit-events'); }
  getManifestByTransfer(transferId) { return this.manifests.getById(encodeURIComponent(transferId)); }
  getTransferAudit(transferId) { return baseApi.http.get(`/api/v1/transfers/${encodeURIComponent(transferId)}/audit`); }
  getTraceabilityReport(transferId) { return baseApi.http.get(`/api/v1/transfers/${encodeURIComponent(transferId)}/traceability-report`); }
  getTraceabilityReportPdf(transferId) { return baseApi.http.get(`/api/v1/transfers/${encodeURIComponent(transferId)}/traceability-report/pdf`, { responseType: 'blob' }); }
  prepareReception(transferId, body) { return baseApi.http.post(`/api/v1/custody-transfers/${encodeURIComponent(transferId)}/reception`, body); }
  verifyOtp(transferId, code) { return baseApi.http.post(`/api/v1/custody-transfers/${encodeURIComponent(transferId)}/otp-verifications`, { code }); }
  acceptReception(transferId, body) { return baseApi.http.post(`/api/v1/custody-transfers/${encodeURIComponent(transferId)}/acceptance`, body); }
  rejectThermalExcursion(transferId, reason) { return baseApi.http.post(`/api/v1/custody-transfers/${encodeURIComponent(transferId)}/rejections/thermal-excursion`, { reason }); }
  rejectTampering(transferId, reason) { return baseApi.http.post(`/api/v1/custody-transfers/${encodeURIComponent(transferId)}/rejections/tampering`, { reason }); }
}
