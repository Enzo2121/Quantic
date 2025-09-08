import type {
  EspaceVertItem,
  EspaceVertFilters,
} from '~/types/datasets'

export const useEspacesVertsStore = defineStore('espaces-verts', () => {
  return useNuxtDataStore<EspaceVertItem, EspaceVertFilters>({
    endpoint: '/api/espaces-verts',
    defaultFilters: {
      search: '',
      types: [],
      categories: [],
      arrondissements: [],
      horaires: [],
    },
    filterFields: ['types', 'categories', 'arrondissements', 'horaires'],
    storeKey: 'espaces-verts',
    lazyLoading: {
      initialLoadSize: 20,
      mediumLoadSize: 200,
      fullLoadSize: 1500, 
      autoLoadOnSearch: true,
    },
  })
})
