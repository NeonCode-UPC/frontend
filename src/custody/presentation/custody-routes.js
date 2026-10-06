const custodyView = () => import('./views/custody-view.vue');

const custodyRoutes = [
    { path: '', name: 'custody', component: custodyView, meta: { title: 'Cadena de Custodia' } }
];

export default custodyRoutes;
