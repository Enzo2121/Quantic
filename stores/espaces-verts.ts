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
      arrondissements: []
    },
    filterFields: ['types', 'categories', 'arrondissements'],
    storeKey: 'espaces-verts'
  })
})
