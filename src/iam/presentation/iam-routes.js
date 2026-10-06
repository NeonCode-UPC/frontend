const iamView = () => import('./views/iam-view.vue');

const iamRoutes = [
    { path: '', name: 'iam', component: iamView, meta: { title: 'IAM' } }
];

export default iamRoutes;
