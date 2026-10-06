const transportView = () => import('./views/transport-view.vue');

const transportRoutes = [
    { path: '', name: 'transport', component: transportView, meta: { title: 'Transporte & Despacho' } }
];

export default transportRoutes;
