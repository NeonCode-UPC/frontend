<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();
const drawerVisible = ref(false);

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const navigationItems = [
  { label: 'option.home', to: '/home', icon: 'pi pi-chart-bar' },
  { label: 'option.landing', to: '/landing', icon: 'pi pi-globe' },
  { label: 'option.telemetry', to: '/telemetry', icon: 'pi pi-box' },
  { label: 'option.transport', to: '/transport', icon: 'pi pi-truck' },
  { label: 'option.alerting', to: '/alerting', icon: 'pi pi-exclamation-triangle' },
  { label: 'option.custody', to: '/custody', icon: 'pi pi-lock' },
  { label: 'option.iam', to: '/iam', icon: 'pi pi-id-card' },
  { label: 'option.about', to: '/about', icon: 'pi pi-info-circle' }
];
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog />

  <header class="sticky top-0 z-5 w-full shadow-2">
    <pv-toolbar class="bg-medical-navy border-none border-noround px-4 py-2">
      <template #start>
        <pv-button icon="pi pi-bars" text rounded severity="secondary" class="text-white mr-2" @click="toggleDrawer" />
        <router-link to="/home" class="flex align-items-center gap-2 no-underline">
          <img src="/logo.png" alt="Medical SMARTBOX" class="h-2rem w-auto border-circle" />
          <span class="text-white font-bold text-lg hidden sm:inline">Medical SMARTBOX</span>
        </router-link>
      </template>

      <template #center>
        <div class="hidden lg:flex align-items-center gap-2">
          <router-link
            v-for="item in navigationItems.slice(0, 5)"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 text-sm text-gray-200 hover:text-white font-medium border-round transition-colors transition-duration-150 hover:bg-white-alpha-10 no-underline"
            active-class="bg-white-alpha-20 text-white font-bold"
          >
            <i :class="item.icon + ' mr-1 text-xs'"></i>
            {{ t(item.label) }}
          </router-link>
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-3">
          <pv-tag severity="success" class="hidden md:inline-flex align-items-center gap-1 font-semibold text-xs">
            <i class="pi pi-check-circle text-xs"></i>
            {{ t('nav.network-active') }}
          </pv-tag>
          <language-switcher />
          <router-link to="/iam">
            <pv-button icon="pi pi-user" label="IAM" size="small" class="bg-medical-teal border-none text-white font-semibold" />
          </router-link>
        </div>
      </template>
    </pv-toolbar>

    <!-- Side Navigation Drawer -->
    <pv-drawer v-model:visible="drawerVisible" header="Menú Medical SMARTBOX" class="w-20rem">
      <div class="flex flex-column gap-2 mt-2">
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          @click="drawerVisible = false"
          class="flex align-items-center gap-3 px-3 py-3 text-color font-medium border-round hover:surface-100 transition-colors no-underline"
          active-class="bg-teal-50 text-teal-800 font-bold"
        >
          <i :class="item.icon + ' text-teal-700 text-lg'"></i>
          <span>{{ t(item.label) }}</span>
        </router-link>
      </div>
    </pv-drawer>
  </header>

  <main class="min-h-screen px-3 py-4 md:px-6 md:py-5 max-w-7xl mx-auto">
    <router-view />
  </main>

  <footer-content />
</template>

<style scoped>
</style>
