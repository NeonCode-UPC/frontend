/** A custody transfer records each hand-off of a medical shipment. */
export class CustodyTransfer {
  constructor({ id, route, cargo, departureAt, receivedAt = null, recipient = null, status, temperatureMax, temperatureRange, openings = 0, smartBox, events = [], temperatureReadings = [], otpAttempts = 0, otpMaxAttempts = 3 }) {
    Object.assign(this, { id, route, cargo, departureAt, receivedAt, recipient, status, temperatureMax, temperatureRange, openings, smartBox, events, temperatureReadings, otpAttempts, otpMaxAttempts });
    this.otpVerified = status === 'otp-verified';
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
    return this.otpVerified === true || this.status === 'otp-verified';
  }
}
