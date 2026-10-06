import { createRouter, createWebHistory } from "vue-router";
import Home from "./shared/presentation/views/home.vue";
import iamRoutes from "./iam/presentation/iam-routes.js";
import telemetryRoutes from "./telemetry/presentation/telemetry-routes.js";
import transportRoutes from "./transport/presentation/transport-routes.js";
import alertingRoutes from "./alerting/presentation/alerting-routes.js";
import custodyRoutes from "./custody/presentation/custody-routes.js";

const landing = () => import('./shared/presentation/views/landing.vue');
const about = () => import('./shared/presentation/views/about.vue');
const reports = () => import('./shared/presentation/views/reports-view.vue');
const settings = () => import('./shared/presentation/views/settings-view.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/home', name: 'home', component: Home, meta: { title: 'Panel' } },
    { path: '/transport', name: 'transport', children: transportRoutes },
    { path: '/telemetry', name: 'telemetry', children: telemetryRoutes },
    { path: '/alerting', name: 'alerting', children: alertingRoutes },
    { path: '/custody', name: 'custody', children: custodyRoutes },
    { path: '/reports', name: 'reports', component: reports, meta: { title: 'Reportes' } },
    { path: '/iam', name: 'iam', children: iamRoutes },
    { path: '/settings', name: 'settings', component: settings, meta: { title: 'Ajustes' } },
    { path: '/landing', name: 'landing', component: landing, meta: { title: 'Solución Médica' } },
    { path: '/about', name: 'about', component: about, meta: { title: 'Acerca de' } },
    { path: '/', redirect: '/home' },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Página no encontrada' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach((to, from) => {
    const baseTitle = 'Medical SmartBox';
    document.title = to.meta && to.meta.title ? `${baseTitle} - ${to.meta.title}` : baseTitle;
    return true;
});

export default router;
