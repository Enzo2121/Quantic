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
    },
    filterFields: ['types', 'arrondissements'],
    storeKey: 'equipements-sportifs',
  })
})
