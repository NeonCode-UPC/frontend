const telemetryView = () => import('./views/telemetry-view.vue');

const telemetryRoutes = [
    { path: '', name: 'telemetry', component: telemetryView, meta: { title: 'Telemetría IoT' } }
];

export default telemetryRoutes;
