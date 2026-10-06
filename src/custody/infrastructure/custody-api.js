import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const baseApi = new BaseApi();

export class CustodyApi {
  constructor() {
    this.transfers = new BaseEndpoint(baseApi, '/custody-transfers');
    this.manifests = new BaseEndpoint(baseApi, '/digital-audit-manifests');
  }

  getTransfers() { return this.transfers.getAll(); }
  getManifests() { return this.manifests.getAll(); }
  getManifestByTransfer(transferId) { return baseApi.http.get(`/digital-audit-manifests?transferId=${transferId}`); }
}
