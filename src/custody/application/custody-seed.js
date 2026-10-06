export const custodySeed = [
  {
    id: 'TR-0244', route: 'Callao → Chincha', cargo: 'Hemocomponentes', departureAt: '28/09/2026 · 07:10',
    receivedAt: '28/09/2026 · 10:15', recipient: 'Dr. Jorge Paredes Lino', status: 'closed',
    temperatureMax: '5,6 °C', openings: 0, smartBox: 'SB-0165',
    events: [
      { time: '10:15', date: '28/09/2026', title: 'Recepción confirmada', detail: 'Dr. Jorge Paredes Lino · Hospital de Chincha', type: 'success' },
      { time: '10:12', date: '28/09/2026', title: 'Verificación de entrega', detail: 'Código OTP validado · carga conforme', type: 'success' },
      { time: '07:10', date: '28/09/2026', title: 'Traslado iniciado', detail: 'Marta Rojas · SB-0165 · Callao', type: 'default' }
    ]
  },
  {
    id: 'TR-0417', route: 'Lima → Arequipa', cargo: 'Vacunas · 2–8 °C', departureAt: '29/09/2026 · 08:05',
    receivedAt: null, recipient: null, status: 'in-transit', temperatureMax: '5,4 °C', openings: 0, smartBox: 'SB-0182',
    events: [
      { time: '14:35', date: '29/09/2026', title: 'ETA de llegada', detail: 'Hospital Regional Goyeneche · en ruta', type: 'current' },
      { time: '08:05', date: '29/09/2026', title: 'Traslado iniciado', detail: 'Marta Rojas · SB-0182 · Lima', type: 'default' }
    ]
  },
  {
    id: 'TR-0233', route: 'Lima → Ica', cargo: 'Muestras biológicas', departureAt: '25/09/2026 · 06:40',
    receivedAt: '25/09/2026 · 11:20', recipient: 'Lic. Rosa Vela', status: 'exception',
    temperatureMax: '8,7 °C', openings: 1, smartBox: 'SB-0139',
    events: [
      { time: '11:20', date: '25/09/2026', title: 'Recepción confirmada con incidencia', detail: 'Lic. Rosa Vela · excursión térmica registrada', type: 'warning' },
      { time: '09:18', date: '25/09/2026', title: 'Excursión térmica detectada', detail: 'Máximo 8,7 °C · alerta INC-0308', type: 'warning' },
      { time: '06:40', date: '25/09/2026', title: 'Traslado iniciado', detail: 'SB-0139 · Lima', type: 'default' }
    ]
  }
];

export const manifestSeed = [
  { id: 'MAN-0244', transferId: 'TR-0244', sealedAt: '28/09/2026 · 10:15', hash: '9f2c7a4b8d31e5620c41a71e', status: 'valid', recipient: 'Dr. Jorge Paredes Lino', temperatureMax: '5,6 °C', openings: 0, cargo: 'Hemocomponentes' },
  { id: 'MAN-0233', transferId: 'TR-0233', sealedAt: '25/09/2026 · 11:20', hash: '70ac19d44e2b6f839c01d5a7', status: 'valid', recipient: 'Lic. Rosa Vela', temperatureMax: '8,7 °C', openings: 1, cargo: 'Muestras biológicas' }
];

export const auditSeed = [
  { id: 'AUD-001', date: '29/09/2026', time: '14:36', user: 'Dr. Jorge Paredes', event: 'Recepción confirmada', resource: 'TR-0417' },
  { id: 'AUD-002', date: '29/09/2026', time: '13:44', user: 'Luis Quispe', event: 'Alerta reconocida', resource: 'INC-0312' },
  { id: 'AUD-003', date: '29/09/2026', time: '09:20', user: 'Andrea Salazar', event: 'Umbral editado', resource: 'Vacunas 2–8 °C' },
  { id: 'AUD-004', date: '28/09/2026', time: '16:02', user: 'Luis Quispe', event: 'SmartBox vinculado', resource: 'SB-0165' }
];
