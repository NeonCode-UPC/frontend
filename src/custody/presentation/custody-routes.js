const custodyView = () => import('./views/custody-view.vue');
const digitalRecordsView = () => import('./views/digital-records-view.vue');
const auditView = () => import('./views/audit-view.vue');

const custodyRoutes = [
    { path: '', name: 'custody-chain', component: custodyView, meta: { title: 'Cadena de Custodia' } },
    { path: 'records', name: 'custody-records', component: digitalRecordsView, meta: { title: 'Actas Digitales' } },
    { path: 'audit', name: 'custody-audit', component: auditView, meta: { title: 'Auditoría' } }
];

export default custodyRoutes;
