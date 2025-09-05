import type {
  FontaineItem,
  FontaineFilters,
} from '~/types/datasets'

export const useFontainesStore = defineStore('fontaines', () => {
  return useNuxtDataStore<FontaineItem, FontaineFilters>({
    endpoint: '/api/fontaines',
    defaultFilters: {
      search: '',
      types: [],
      etats: [],
      arrondissements: [],
      accessibilite: [],
    },
    filterFields: ['types', 'etats', 'arrondissements', 'accessibilite'],
    storeKey: 'fontaines',
    lazyLoading: {
      initialLoadSize: 20,
      mediumLoadSize: 200,
      fullLoadSize: 1500,
      autoLoadOnSearch: true,
    },
  })
})
