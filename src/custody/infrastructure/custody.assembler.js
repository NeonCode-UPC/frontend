import { CustodyTransfer } from '../domain/custody-transfer.js';
import { DigitalAuditManifest } from '../domain/digital-audit-manifest.js';

export const toCustodyTransfer = (data) => new CustodyTransfer(data);
export const toDigitalAuditManifest = (data) => new DigitalAuditManifest(data);
