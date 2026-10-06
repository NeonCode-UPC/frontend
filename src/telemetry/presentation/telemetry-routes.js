const telemetryView = () => import('./views/telemetry-view.vue');
const liveTelemetryView = () => import('./views/live-telemetry-view.vue');

const telemetryRoutes = [
    { path: '', name: 'telemetry-containers', component: telemetryView, meta: { title: 'SmartBox' } },
    { path: 'live', name: 'telemetry-live', component: liveTelemetryView, meta: { title: 'Telemetría en Vivo' } }
];

export default telemetryRoutes;
