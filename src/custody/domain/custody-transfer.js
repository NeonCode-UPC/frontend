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

  get isOtpVerified() {
    return this.otpVerified === true;
  }

  prepareReception(recipient) {
    if (!this.canPrepareReception) throw new Error('El traslado no está disponible para recepción.');
    if (!recipient?.trim()) throw new Error('Indica el responsable de recepción.');
    this.recipient = recipient.trim();
    this.status = 'pending-otp';
    this.otpVerified = false;
  }

  verifyOtp(code, expectedCode) {
    if (!this.isAwaitingOtp) throw new Error('Prepara la recepción antes de verificar el código.');
    if (!/^\d{6}$/.test(code)) throw new Error('Ingresa los 6 dígitos del código.');
    if (code !== expectedCode) throw new Error('Código incorrecto.');
    this.otpVerified = true;
  }

  confirmReception({ date, time }) {
    if (!this.isAwaitingOtp || !this.isOtpVerified) throw new Error('Primero verifica el código OTP del receptor.');
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
