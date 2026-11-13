/** Immutable audit summary attached to a completed custody transfer. */
export class DigitalAuditManifest {
  constructor(data = {}) {
    Object.assign(this, {
      id: data.id,
      manifestId: data.manifestId,
      transferId: data.transferId,
      sealedAt: data.sealedAt,
      hash: data.hash,
      status: data.status || 'valid',
      recipient: data.recipient,
      temperatureMax: data.temperatureMax,
      openings: data.openings ?? 0,
      cargo: data.cargo,
      isSealedAndImmutable: data.isSealedAndImmutable ?? true,
      averageTemperatureCelsius: data.averageTemperatureCelsius,
      minTemperatureCelsius: data.minTemperatureCelsius,
      maxTemperatureCelsius: data.maxTemperatureCelsius,
      totalExcursionSeconds: data.totalExcursionSeconds ?? 0,
      minsaComplianceVerified: data.minsaComplianceVerified ?? false,
      hashVerified: data.hashVerified ?? false,
      cloudStorageUrl: data.cloudStorageUrl || null
    });
  }
}
