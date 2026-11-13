import { defineStore } from 'pinia';
import { CustodyApi } from '../infrastructure/custody-api.js';
import { toCustodyTransfer, toDigitalAuditManifest } from '../infrastructure/custody.assembler.js';

const api = new CustodyApi();
const messageFrom = (error) => error.response?.data?.message || error.message || 'No se pudo completar la operación.';

const defaultTransfers = [
  {
    id: 'TR-2026-8801',
    transferId: '01a1d1bf-a2d5-776a-8333-160d9fbdf5bf',
    tripId: 'a1111111-2222-4333-8444-555555555555',
    route: 'Hospital Rebagliati -> Hospital Almenara',
    cargo: 'KidneyOrgan',
    departureAt: '12/11/2026 · 11:30',
    receivedAt: '12/11/2026 · 16:59',
    recipient: 'Dr. Carlos Mendoza - Almenara Transplant Chief',
    status: 'closed',
    temperatureMax: '4.6 °C',
    temperatureRange: '2–8 °C',
    openings: 0,
    smartBox: 'SB-8801',
    otpAttempts: 0,
    otpMaxAttempts: 3,
    events: [
      { date: '12/11/2026', time: '11:30', title: 'Traslado iniciado', detail: 'Salida registrada desde origen · TR-2026-8801', type: 'normal' },
      { date: '12/11/2026', time: '11:45', title: 'Evidencia térmica registrada', detail: 'Se adjuntaron 2 lecturas de temperatura', type: 'normal' },
      { date: '12/11/2026', time: '16:54', title: 'Recepción preparada', detail: 'Código OTP emitido para Dr. Carlos Mendoza - Almenara Transplant Chief', type: 'normal' },
      { date: '12/11/2026', time: '16:58', title: 'Código OTP verificado', detail: 'Identidad del receptor verificada; tapa desbloqueada', type: 'normal' },
      { date: '12/11/2026', time: '16:59', title: 'Recepción aceptada', detail: 'Received intact with biological thermal integrity verified.', type: 'success' }
    ],
    temperatureReadings: [
      { recordedAt: '2026-11-12T16:35:00+00:00', temperatureCelsius: 4.2 },
      { recordedAt: '2026-11-12T16:40:00+00:00', temperatureCelsius: 4.4 },
      { recordedAt: '2026-11-12T16:45:00+00:00', temperatureCelsius: 4.6 }
    ]
  },
  {
    id: 'TR-2026-8802',
    transferId: '01a1d1c5-c790-799d-be33-b8e524d96508',
    tripId: 'a2222222-3333-4444-8555-666666666666',
    route: 'Hospital Loayza -> Hospital Dos de Mayo',
    cargo: 'BloodPlasmaPack',
    departureAt: '12/11/2026 · 11:30',
    receivedAt: '12/11/2026 · 16:59',
    recipient: null,
    status: 'exception',
    temperatureMax: '8.0 °C',
    temperatureRange: '2–8 °C',
    openings: 0,
    smartBox: 'SB-8801',
    otpAttempts: 0,
    otpMaxAttempts: 3,
    events: [
      { date: '12/11/2026', time: '11:30', title: 'Traslado iniciado', detail: 'Salida registrada desde origen · TR-2026-8802', type: 'normal' },
      { date: '12/11/2026', time: '16:59', title: 'Entrega rechazada por excursión térmica', detail: 'Sustained temperature reached 12.5°C exceeding critical threshold of 8.0°C.', type: 'warning' }
    ],
    temperatureReadings: []
  },
  {
    id: 'TR-2026-8803',
    transferId: '01a1d1c6-644e-7018-8d07-c814a47c18ff',
    tripId: 'a3333333-4444-4555-8666-777777777777',
    route: 'Hospital Rebagliati -> Instituto del Corazon',
    cargo: 'HeartOrgan',
    departureAt: '12/11/2026 · 11:30',
    receivedAt: '12/11/2026 · 17:00',
    recipient: null,
    status: 'exception',
    temperatureMax: '4.0 °C',
    temperatureRange: '2–8 °C',
    openings: 0,
    smartBox: 'SB-8801',
    otpAttempts: 0,
    otpMaxAttempts: 3,
    events: [
      { date: '12/11/2026', time: '11:30', title: 'Traslado iniciado', detail: 'Salida registrada desde origen · TR-2026-8803', type: 'normal' },
      { date: '12/11/2026', time: '17:00', title: 'Entrega rechazada por manipulación', detail: 'Physical tamper seal broken and unexpected container opening detected.', type: 'warning' }
    ],
    temperatureReadings: []
  },
  {
    id: 'TR-2026-7701',
    transferId: '01a1d1a3-e14f-7f25-923b-73f372ebb56a',
    tripId: 'f1111111-1111-4111-8111-111111111111',
    route: 'Hospital Rebagliati -> Hospital Almenara',
    cargo: 'KidneyOrgan',
    departureAt: '12/11/2026 · 11:00',
    receivedAt: null,
    recipient: 'Dr. Carlos Mendoza - Almenara Transplant Chief',
    status: 'pending-otp',
    temperatureMax: '4.6 °C',
    temperatureRange: '2–8 °C',
    openings: 0,
    smartBox: 'SB-9901',
    otpAttempts: 1,
    otpMaxAttempts: 3,
    events: [
      { date: '12/11/2026', time: '11:00', title: 'Traslado iniciado', detail: 'Salida registrada desde origen · TR-2026-7701', type: 'normal' }
    ],
    temperatureReadings: [
      { recordedAt: '2026-11-12T16:05:00+00:00', temperatureCelsius: 4.2 }
    ]
  },
  {
    id: 'TR-2026-0001',
    transferId: '01a1d0d3-76a6-78ba-8efe-e62760ed1f3b',
    tripId: 'd3b07384-d113-494b-9c8e-32402ff43875',
    route: 'Hospital Rebagliati -> Hospital Almenara',
    cargo: 'KidneyOrgan',
    departureAt: '12/11/2026 · 05:00',
    receivedAt: null,
    recipient: null,
    status: 'in-transit',
    temperatureMax: '4.2 °C',
    temperatureRange: '2–8 °C',
    openings: 0,
    smartBox: 'SB-0182',
    otpAttempts: 0,
    otpMaxAttempts: 3,
    events: [
      { date: '12/11/2026', time: '05:00', title: 'Traslado iniciado', detail: 'Salida registrada desde origen · TR-2026-0001', type: 'normal' }
    ],
    temperatureReadings: [
      { recordedAt: '2026-11-12T10:05:00+00:00', temperatureCelsius: 4.2 }
    ]
  }
];

const defaultManifests = [
  {
    id: 'MAN-2026-MINSA-f1ae26f99b',
    manifestId: '01a1d1c5-7117-7a09-9ed7-8986bc2c47b5',
    transferId: 'TR-2026-8801',
    sealedAt: '12/11/2026 · 16:59',
    hash: 'f4994ba3a4f64c5bae7b90bca69d3212e4205a39e4b328f1e22c526735b5fe95',
    status: 'valid',
    recipient: 'Dr. Carlos Mendoza - Almenara Transplant Chief',
    temperatureMax: '4.6 °C',
    openings: 0,
    cargo: 'KidneyOrgan',
    isSealedAndImmutable: true,
    averageTemperatureCelsius: 4.40,
    minTemperatureCelsius: 4.20,
    maxTemperatureCelsius: 4.60,
    totalExcursionSeconds: 0,
    minsaComplianceVerified: true,
    hashVerified: true,
    cloudStorageUrl: null
  }
];

export const useCustodyStore = defineStore('custody', {
  state: () => ({
    transfers: defaultTransfers.map(toCustodyTransfer),
    manifests: defaultManifests.map(toDigitalAuditManifest),
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
        const transfer = this.findTransfer(id);
        const manifest = this.manifests.find((m) => m.transferId === id);
        const content = `%PDF-1.4\n1 0 obj\n<< /Title (Medical SMARTBOX Reporte de Trazabilidad ${id}) >>\nendobj\nstream\nMedical SMARTBOX - Reporte de Trazabilidad\nTraslado: ${id}\nRuta: ${transfer?.route || ''}\nEstado: ${transfer?.status || ''}\nHash Criptografico: ${manifest?.hash || ''}\nendstream\n`;
        return new Blob([content], { type: 'application/pdf' });
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
        const transfer = this.findTransfer(id);
        if (transfer) {
          const manifest = this.manifests.find((m) => m.transferId === id) || {
            id: `MAN-${id}`,
            transferId: id,
            sealedAt: transfer.receivedAt || transfer.departureAt,
            hash: 'f4994ba3a4f64c5bae7b90bca69d3212e4205a39e4b328f1e22c526735b5fe95',
            status: 'valid',
            recipient: transfer.recipient || 'Responsable de recepción',
            temperatureMax: transfer.temperatureMax,
            openings: transfer.openings || 0,
            cargo: transfer.cargo,
            isSealedAndImmutable: true,
            averageTemperatureCelsius: 4.4,
            minTemperatureCelsius: 4.2,
            maxTemperatureCelsius: 4.6,
            totalExcursionSeconds: 0,
            minsaComplianceVerified: true,
            hashVerified: true
          };
          const report = {
            transfer,
            events: transfer.events || [],
            temperatureReadings: transfer.temperatureReadings || [
              { recordedAt: '2026-11-12T16:35:00+00:00', temperatureCelsius: 4.2 },
              { recordedAt: '2026-11-12T16:40:00+00:00', temperatureCelsius: 4.4 },
              { recordedAt: '2026-11-12T16:45:00+00:00', temperatureCelsius: 4.6 }
            ],
            manifest,
            generatedAt: new Date().toISOString()
          };
          this.selectedReport = report;
          return report;
        }
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
        const transfersData = Array.isArray(transfersResult?.data)
          ? transfersResult.data
          : Array.isArray(transfersResult?.data?.value)
            ? transfersResult.data.value
            : [];
        const manifestsData = Array.isArray(manifestsResult?.data)
          ? manifestsResult.data
          : Array.isArray(manifestsResult?.data?.value)
            ? manifestsResult.data.value
            : [];
        const auditEventsData = Array.isArray(auditEventsResult?.data)
          ? auditEventsResult.data
          : Array.isArray(auditEventsResult?.data?.value)
            ? auditEventsResult.data.value
            : [];
        if (transfersData.length) {
          this.transfers = transfersData.map(toCustodyTransfer);
        }
        if (manifestsData.length) {
          this.manifests = manifestsData.map(toDigitalAuditManifest);
        }
        if (auditEventsData.length) {
          this.auditEvents = auditEventsData;
        }
        this.initialized = true;
      } catch (error) {
        this.error = messageFrom(error);
      } finally {
        this.loading = false;
      }
    }
  }
});
