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
      arrondissements: []
    },
    filterFields: ['types', 'etats', 'arrondissements'],
    storeKey: 'fontaines'
  })
})
