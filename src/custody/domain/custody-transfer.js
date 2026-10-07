/** A custody transfer records each hand-off of a medical shipment. */
export class CustodyTransfer {
  constructor({ id, route, cargo, departureAt, receivedAt = null, recipient = null, status, temperatureMax, temperatureRange, openings = 0, smartBox, events = [] }) {
    Object.assign(this, { id, route, cargo, departureAt, receivedAt, recipient, status, temperatureMax, temperatureRange, openings, smartBox, events });
  }

  get isClosed() {
    return this.status === 'closed';
  }
}
