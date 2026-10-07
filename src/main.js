import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import Tooltip from 'primevue/tooltip';
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Toast,
    Textarea,
    ToastService,
    Toolbar
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";
import BaseScreen from './shared/presentation/components/base-screen.vue';
import KpiCard from './shared/presentation/components/kpi-card.vue';
import ContentCard from './shared/presentation/components/content-card.vue';
import StatusBadge from './shared/presentation/components/status-badge.vue';
import EmptyState from './shared/presentation/components/empty-state.vue';

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY;

createApp(App)
    .component('base-screen',       BaseScreen)
    .component('kpi-card',          KpiCard)
    .component('content-card',      ContentCard)
    .component('status-badge',      StatusBadge)
    .component('empty-state',       EmptyState)
    .use(i18n)
    .use(PrimeVue, { theme: { preset: Material }, ripple: true, license: primeUiLicenseKey })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox',       Checkbox)
    .component('pv-data-table',     DataTable)
    .component('pv-dialog',         Dialog)
    .component('pv-select',         Select)
    .component('pv-select-button',  SelectButton)
    .component('pv-file-upload',    FileUpload)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-text',     InputText)
    .component('pv-input-number',   InputNumber)
    .component('pv-menu',           Menu)
    .component('pv-rating',         Rating)
    .component('pv-row',            Row)
    .component('pv-drawer',         Drawer)
    .component('pv-tag',            Tag)
    .component('pv-textarea',       Textarea)
    .component('pv-toolbar',        Toolbar)
    .component('pv-toast',          Toast)
    .directive('tooltip',           Tooltip)
    .use(router)
    .use(pinia)
    .mount('#app');
