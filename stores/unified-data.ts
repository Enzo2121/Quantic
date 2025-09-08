import type { UnifiedDataItem, UnifiedFilters, SelectOption } from '~/types/datasets'

type SourceType = 'equipements' | 'espaces-verts' | 'fontaines'
type FilterKeys = keyof Omit<UnifiedFilters, 'search' | 'sources'>

export const useUnifiedDataStore = defineStore('unified-data', () => {
  const data = ref<UnifiedDataItem[]>([])
  const filteredData = ref<UnifiedDataItem[]>([])
  const filters = ref<UnifiedFilters>({
    search: '',
    sources: ['equipements', 'espaces-verts', 'fontaines'],
    types: [], arrondissements: [], categories: [], etats: [], tarifs: [], horaires: [],
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({ page: 1, pageSize: 20, total: 0 })
  const sort = ref({ sortBy: null as string | null, sortOrder: 'asc' as 'asc' | 'desc' })
  const filterOptions = ref<Record<string, SelectOption[]>>({})
  const isLoaded = ref(false)
  
  const stores = {
    equipements: useEquipementsSportifsStore(),
    'espaces-verts': useEspacesVertsStore(),
    fontaines: useFontainesStore(),
  }

  const transformConfigs = {
    equipements: (item: any) => ({
      source: 'equipements' as const,
      payant: item.payant,
      horaires: item.horaires,
    }),
    'espaces-verts': (item: any) => ({
      source: 'espaces-verts' as const,
      categorie: item.categorie,
      superficie: item.superficie,
      ouvert_24h: item.ouvert_24h,
      canicule_ouverture: item.canicule_ouverture,
      horaires: item.ouvert_24h === 'Oui' ? 'Ouvert 24h/24' : 'Horaires normaux',
    }),
    fontaines: (item: any) => ({
      source: 'fontaines' as const,
      etat: item.etat,
    }),
  }

  function transformToUnified(): UnifiedDataItem[] {
    return filters.value.sources.flatMap(source => 
      (stores[source].data || []).map(item => ({
        id: `${source}_${item.id || item.recordid}`,
        nom: item.nom || item.name || '',
        type: item.type || '',
        adresse: item.adresse || item.address || '',
        arrondissement: item.arrondissement || '',
        latitude: item.latitude || item.lat,
        longitude: item.longitude || item.lng,
        sourceType: item.type || '',
        ...transformConfigs[source](item),
      }))
    )
  }

  const filterConfig: Record<FilterKeys, (item: UnifiedDataItem, values: string[]) => boolean> = {
    types: (item, values) => values.includes(item.type),
    arrondissements: (item, values) => values.includes(item.arrondissement),
    categories: (item, values) => item.source !== 'espaces-verts' || !item.categorie || values.includes(item.categorie),
    etats: (item, values) => item.source !== 'fontaines' || !item.etat || values.includes(item.etat),
    tarifs: (item, values) => item.source !== 'equipements' || !item.payant || values.includes(item.payant),
    horaires: (item, values) => !item.horaires || values.some(h => 
      item.horaires?.includes(h) || (h === 'Ouvert 24h/24' && item.ouvert_24h === 'Oui')
    ),
  }

  function applyFilters(dataToFilter: UnifiedDataItem[]): UnifiedDataItem[] {
    let filtered = dataToFilter

    if (filters.value.search?.trim()) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(item => 
        [item.nom, item.adresse, item.type, item.arrondissement]
          .some(field => field?.toLowerCase().includes(search))
      )
    }

    if (filters.value.sources.length > 0) {
      filtered = filtered.filter(item => filters.value.sources.includes(item.source))
    }

    for (const [key, filterFn] of Object.entries(filterConfig)) {
      const values = filters.value[key as FilterKeys]
      if (values.length > 0) {
        filtered = filtered.filter(item => filterFn(item, values))
      }
    }

    return filtered
  }

  async function loadAllData() {
    if (loading.value) return
    
    loading.value = true
    error.value = null

    try {
      await nextTick()
      await Promise.all([
        stores.equipements.loadMoreData('full'),
        stores['espaces-verts'].loadMoreData('full'),
        stores.fontaines.loadMoreData('full'),
      ])

      await nextTick()
      data.value = transformToUnified()
      filteredData.value = applyFilters(data.value)
      pagination.value.total = filteredData.value.length
      calculateFilterOptions()
      isLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des données'
    } finally {
      loading.value = false
    }
  }

  async function updateFilters(newFilters: Partial<UnifiedFilters>) {
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
  }

  const optionsConfig = {
    types: { sourceFilter: null, field: 'type', sortBy: 'count' },
    arrondissements: { sourceFilter: null, field: 'arrondissement', sortBy: 'label' },
    categories: { sourceFilter: 'espaces-verts', field: 'categorie', sortBy: 'count' },
    etats: { sourceFilter: 'fontaines', field: 'etat', sortBy: 'count' },
    tarifs: { sourceFilter: 'equipements', field: 'payant', sortBy: 'count' },
    horaires: { sourceFilter: null, field: 'horaires', sortBy: 'count' },
  }

  function calculateFilterOptions() {
    if (!data.value.length) {
      filterOptions.value = {}
      return
    }

    const options: Record<string, SelectOption[]> = {}

    for (const [key, config] of Object.entries(optionsConfig)) {
      const map = new Map<string, number>()
      const sourceFilteredData = config.sourceFilter 
        ? data.value.filter(item => item.source === config.sourceFilter)
        : data.value

      sourceFilteredData.forEach(item => {
        const value = item[config.field as keyof UnifiedDataItem] as string
        if (value && value.trim()) {
          map.set(value, (map.get(value) || 0) + 1)
        }
      })

      options[key] = Array.from(map.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => {
          if (config.sortBy === 'count') {
            return b.count - a.count
          }
          return a.label.localeCompare(b.label)
        })
    }

    filterOptions.value = options
  }

  function reset() {
    Object.assign(filters.value, {
      search: '', sources: ['equipements', 'espaces-verts', 'fontaines'],
      types: [], arrondissements: [], categories: [], etats: [], tarifs: [], horaires: [],
    })
    pagination.value.page = 1
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
  }

  const currentPageData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    return filteredData.value.slice(start, start + pagination.value.pageSize)
  })

  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

  watch(data, calculateFilterOptions, { immediate: true })
  watch(filters, () => {
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
    pagination.value.page = 1
  }, { deep: true })

  return {
    data: readonly(data), filteredData: readonly(filteredData), filters,
    loading: readonly(loading), error: readonly(error), pagination, sort,
    filterOptions: readonly(filterOptions), isLoaded: readonly(isLoaded),
    currentPageData, totalPages,
    loadAllData, updateFilters, reset, calculateFilterOptions,
  }
})