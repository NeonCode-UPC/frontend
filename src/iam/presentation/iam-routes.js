const usersView = () => import('./views/users-view.vue');
const subscriptionView = () => import('./views/subscription-view.vue');

const iamRoutes = [
    { path: '', redirect: '/iam/users' },
    { path: 'users', name: 'iam-users', component: usersView, meta: { title: 'Usuarios y Roles' } },
    { path: 'subscription', name: 'iam-subscription', component: subscriptionView, meta: { title: 'Suscripción' } }
];

export default iamRoutes;
