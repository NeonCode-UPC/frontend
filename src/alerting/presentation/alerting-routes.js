const alertingView = () => import('./views/alerting-view.vue');
const incidentsView = () => import('./views/incidents-view.vue');

const alertingRoutes = [
    { path: '', name: 'critical-alerts', component: alertingView, meta: { title: 'Alertas' } },
    { path: 'incidents', name: 'incidents-history', component: incidentsView, meta: { title: 'Incidentes' } }
];

export default alertingRoutes;
