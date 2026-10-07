import { ref } from 'vue';

const searchQuery = ref('');
const searchPlaceholder = ref('Filtrar por ruta, estado o SmartBox');
const searchVisible = ref(true);
const notificationCount = ref(2);

const currentUser = ref({
  name: 'Luis Quispe',
  role: 'Operador logístico',
  institution: 'Clínica San Borja'
});

/**
 * Composable to manage the application header state across different screens.
 * Allows each screen to easily customize search placeholder, listen to search queries,
 * or toggle search visibility according to its needs.
 */
export function useLayoutHeader() {
  function configureHeader(options = {}) {
    if (options.placeholder !== undefined) {
      searchPlaceholder.value = options.placeholder;
    }
    if (options.visible !== undefined) {
      searchVisible.value = options.visible;
    }
    if (options.initialQuery !== undefined) {
      searchQuery.value = options.initialQuery;
    }
    if (options.notificationCount !== undefined) {
      notificationCount.value = options.notificationCount;
    }
  }

  function clearSearch() {
    searchQuery.value = '';
  }

  return {
    searchQuery,
    searchPlaceholder,
    searchVisible,
    notificationCount,
    currentUser,
    configureHeader,
    clearSearch
  };
}
