const alertingView = () => import('./views/alerting-view.vue');

const alertingRoutes = [
    { path: '', name: 'alerting', component: alertingView, meta: { title: 'Alertas Críticas' } }
];

export default alertingRoutes;
