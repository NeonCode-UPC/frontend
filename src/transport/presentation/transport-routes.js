const transportView = () => import('./views/transport-view.vue');
const routeEtaView = () => import('./views/route-eta-view.vue');
const ambulancesView = () => import('./views/ambulances-view.vue');

const transportRoutes = [
    { path: '', name: 'transport-orders', component: transportView, meta: { title: 'Traslados' } },
    { path: 'routes', name: 'transport-routes-eta', component: routeEtaView, meta: { title: 'Ruta y ETA' } },
    { path: 'ambulances', name: 'transport-ambulances', component: ambulancesView, meta: { title: 'Ambulancias' } }
];

export default transportRoutes;
