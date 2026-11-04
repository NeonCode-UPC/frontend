/** A custody transfer records each hand-off of a medical shipment. */
export class CustodyTransfer {
  constructor({ id, route, cargo, departureAt, receivedAt = null, recipient = null, status, temperatureMax, temperatureRange, openings = 0, smartBox, events = [] }) {
    Object.assign(this, { id, route, cargo, departureAt, receivedAt, recipient, status, temperatureMax, temperatureRange, openings, smartBox, events });
  }

  get isClosed() {
    return this.status === 'closed';
  }

  get canPrepareReception() {
    return this.status === 'in-transit';
  }

  get isAwaitingOtp() {
    return this.status === 'pending-otp';
  }

  prepareReception(recipient) {
    if (!this.canPrepareReception) throw new Error('El traslado no está disponible para recepción.');
    if (!recipient?.trim()) throw new Error('Indica el responsable de recepción.');
    this.recipient = recipient.trim();
    this.status = 'pending-otp';
  }

  confirmReception({ date, time }) {
    if (!this.isAwaitingOtp) throw new Error('Primero verifica el código OTP del receptor.');
    this.status = 'closed';
    this.receivedAt = `${date} · ${time}`;
    this.events = [...this.events, {
      date,
      time,
      title: 'Recepción confirmada',
      detail: `${this.recipient} · custodia cerrada con OTP`,
      type: 'success'
    }];
  }
}
