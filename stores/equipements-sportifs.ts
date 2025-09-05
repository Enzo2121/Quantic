import type {
  EquipementSportifItem,
  EquipementSportifFilters,
} from '~/types/datasets'

export const useEquipementsSportifsStore = defineStore('equipements-sportifs', () => {
  return useNuxtDataStore<EquipementSportifItem, EquipementSportifFilters>({
    endpoint: '/api/equipements-sportifs',
    defaultFilters: {
      search: '',
      types: [],
      arrondissements: [],
      tarifs: [],
      horaires: [],
    },
    filterFields: ['types', 'arrondissements', 'tarifs', 'horaires'],
    storeKey: 'equipements-sportifs',
    lazyLoading: {
      initialLoadSize: 20,
      mediumLoadSize: 200,
      fullLoadSize: 1000,
      autoLoadOnSearch: true,
    },
  })
})
