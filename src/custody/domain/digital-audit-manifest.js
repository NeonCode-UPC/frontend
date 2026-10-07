/** Immutable audit summary attached to a completed custody transfer. */
export class DigitalAuditManifest {
  constructor({ id, transferId, sealedAt, hash, status = 'valid', recipient, temperatureMax, openings = 0, cargo }) {
    Object.assign(this, { id, transferId, sealedAt, hash, status, recipient, temperatureMax, openings, cargo });
  }
}
