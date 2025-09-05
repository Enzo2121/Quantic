import type { SelectOption } from '~/types/datasets'

export interface BaseDataItem {
  id: string
  nom: string
  type: string
  adresse: string
  arrondissement: string
  latitude?: number
  longitude?: number
}

export interface BaseFilters {
  search: string
  types: string[]
  arrondissements: string[]
  [key: string]: any
}

export interface LazyLoadingConfig {
  initialLoadSize: number // 20 éléments au départ
  mediumLoadSize: number // 200 éléments pour recherche
  fullLoadSize: number // 1000 éléments pour exploration complète
  autoLoadOnSearch: boolean // Charger automatiquement en mode medium lors de recherche
}

export interface NuxtDataStoreConfig<_T extends BaseDataItem, F extends BaseFilters> {
  endpoint: string
  defaultFilters: F
  filterFields: (keyof F)[]
  storeKey: string
  lazyLoading?: Partial<LazyLoadingConfig>
}

export function useNuxtDataStore<T extends BaseDataItem, F extends BaseFilters>(
  config: NuxtDataStoreConfig<T, F>,
) {
  // Configuration lazy loading avec valeurs par défaut
  const lazyConfig = {
    initialLoadSize: 20,
    mediumLoadSize: 200,
    fullLoadSize: 1000,
    autoLoadOnSearch: true,
    ...config.lazyLoading,
  }

  const filters = ref<F>({ ...config.defaultFilters })
  const pagination = ref({
    page: 1,
    pageSize: lazyConfig.initialLoadSize, // Commencer avec la taille initiale
  })
  const sortBy = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

  // État lazy loading
  const loadingMode = ref<'initial' | 'medium' | 'full'>('initial')
  const isLoadingMore = ref(false)
  const hasLoadedMore = ref(false)

  // Système pour les options complètes (tous les types/arrondissements disponibles)
  const allDataForOptions = ref<T[]>([])
  const isLoadingOptions = ref(false)
  const optionsLoaded = ref(false)

  const {
    data: apiResponse,
    status,
    error,
    refresh,
    clear,
  } = useFetch<{ records: T[], nhits: number, parameters: any }>(config.endpoint, {
    key: config.storeKey,

    query: computed(() => {
      const query: Record<string, any> = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
      }

      if (filters.value.search) {
        query.search = filters.value.search
      }

      if (filters.value.types && filters.value.types.length > 0) {
        query.types = filters.value.types
      }

      if (filters.value.arrondissements && filters.value.arrondissements.length > 0) {
        query.arrondissements = filters.value.arrondissements
      }

      if ('categories' in filters.value && filters.value.categories && filters.value.categories.length > 0) {
        query.categories = filters.value.categories
      }

      if ('etats' in filters.value && filters.value.etats && filters.value.etats.length > 0) {
        query.etats = filters.value.etats
      }

      return query
    }),

    server: true,
    lazy: false,
    dedupe: 'cancel',

    default: () => ({ records: [], nhits: 0, parameters: {} }),

  })

  const data = computed<T[]>(() => {
    if (!apiResponse.value?.records) {
      console.warn(`[${config.storeKey}] No records in API response`)
      return []
    }

    console.warn(`[${config.storeKey}] Processing ${apiResponse.value.records.length} records`)
    
    // Déduplication robuste basée sur l'ID et les propriétés clés
    const uniqueRecords = new Map<string, T>()
    
    apiResponse.value.records.forEach((record) => {
      const uniqueKey = `${record.id || record.nom}_${record.type}_${record.adresse}`
      if (!uniqueRecords.has(uniqueKey)) {
        uniqueRecords.set(uniqueKey, record)
      }
    })
    
    const sorted = Array.from(uniqueRecords.values())

    if (sortBy.value) {
      console.warn(`[${config.storeKey}] Sorting by ${sortBy.value} (${sortOrder.value})`)
      sorted.sort((a, b) => {
        const aVal = (a as any)[sortBy.value!]
        const bVal = (b as any)[sortBy.value!]

        if (aVal == null && bVal == null) {
          return 0
        }
        if (aVal == null) {
          return sortOrder.value === 'asc' ? -1 : 1
        }
        if (bVal == null) {
          return sortOrder.value === 'asc' ? 1 : -1
        }

        if (aVal < bVal) {
          return sortOrder.value === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortOrder.value === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    console.warn(`[${config.storeKey}] Final data: ${sorted.length} unique records from ${apiResponse.value.records.length} total`)
    return sorted
  })

  // Pagination côté client pour éviter les doublons
  const currentPageData = computed(() => {
    const allData = data.value
    const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
    const endIndex = startIndex + pagination.value.pageSize
    
    const paginatedData = allData.slice(startIndex, endIndex)
    console.warn(`[${config.storeKey}] Paginating: ${startIndex}-${endIndex} from ${allData.length} total records`)
    
    return paginatedData
  })

  async function loadAllDataForOptions() {
    if (optionsLoaded.value || isLoadingOptions.value) {
      return
    }

    isLoadingOptions.value = true
    console.warn(`[${config.storeKey}] Loading all data for filter options...`)

    try {
      const allData = await $fetch<{ records: T[], nhits: number }>(config.endpoint, {
        query: {
          page: 1,
          pageSize: Math.min(500, lazyConfig.fullLoadSize),
        },
      })

      allDataForOptions.value = allData.records || []
      optionsLoaded.value = true

      console.warn(`[${config.storeKey}] Loaded ${allDataForOptions.value.length} records for options`)
    }
    catch (error) {
      console.error(`[${config.storeKey}] Error loading options data:`, error)
      if (data.value.length > 0) {
        allDataForOptions.value = data.value
        optionsLoaded.value = true
        console.warn(`[${config.storeKey}] Using current data as fallback for options`)
      }
    }
    finally {
      isLoadingOptions.value = false
    }
  }

  onMounted(async () => {
    await loadAllDataForOptions()
  })

  const totalItems = computed(() => data.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

  const loading = computed(() => status.value === 'pending')
  const isLoaded = computed(() => status.value === 'success' && data.value.length > 0)

  const filterOptions = computed(() => {
    const dataSource = optionsLoaded.value ? allDataForOptions.value : data.value
    console.warn(`[${config.storeKey}] Calculating filterOptions from ${dataSource.length} records (${optionsLoaded.value ? 'complete' : 'partial'} data)`)

    const options: Record<string, SelectOption[]> = {}

    config.filterFields.forEach((field) => {
      const fieldMap = new Map<string, number>()

      dataSource.forEach((item) => {
        const propertyName = field === 'types'
          ? 'type'
          : field === 'arrondissements'
            ? 'arrondissement'
            : field === 'categories'
              ? 'categorie'
              : field === 'etats'
                ? 'etat'
                : field === 'tarifs'
                  ? 'payant'
                  : field === 'horaires'
                    ? 'horaires'
                    : field === 'accessibilite'
                      ? 'accessibilite'
                      : String(field)

        if (field === 'tarifs' && (item as any).payant) {
          const tarif = (item as any).payant.trim()
          if (tarif && tarif !== 'Non spécifié') {
            fieldMap.set(tarif, (fieldMap.get(tarif) || 0) + 1)
          }
        }
        else if (field === 'horaires') {
          if ((item as any).ouvert_24h === 'Oui') {
            fieldMap.set('Ouvert 24h/24', (fieldMap.get('Ouvert 24h/24') || 0) + 1)
          }
          if ((item as any).horaires) {
            const horaire = normalizeHoraire((item as any).horaires)
            if (horaire) {
              fieldMap.set(horaire, (fieldMap.get(horaire) || 0) + 1)
            }
          }
          if ((item as any).canicule_ouverture === 'Oui') {
            fieldMap.set('Ouverture prolongée canicule', (fieldMap.get('Ouverture prolongée canicule') || 0) + 1)
          }
        }
        else {
          const value = (item as any)[propertyName]
          if (value && typeof value === 'string') {
            fieldMap.set(value, (fieldMap.get(value) || 0) + 1)
          }
        }
      })

      const fieldOptions = Array.from(fieldMap.entries())
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

      options[field as string] = fieldOptions
      console.warn(`[${config.storeKey}] Field ${String(field)}: ${fieldOptions.length} options`)
    })

    console.warn(`[${config.storeKey}] FilterOptions calculated:`, Object.keys(options))
    return options
  })

  function normalizeHoraire(horaire: string): string | null {
    if (!horaire || horaire === 'Non spécifié' || horaire.trim() === '') {
      return null
    }

    const horaireStr = horaire.trim().toLowerCase()

    if (horaireStr.includes('24h') || horaireStr.includes('24/24')) {
      return 'Ouvert 24h/24'
    }
    
    if (horaireStr.includes('renseigner') || horaireStr.includes('variable')) {
      return 'Horaires variables'
    }
    
    if (horaireStr.includes('été') || horaireStr.includes('estival')) {
      return 'Horaires été'
    }
    
    if (horaireStr.includes('hiver')) {
      return 'Horaires hiver'
    }
    
    if (horaireStr.match(/\d+h\d*\s*-\s*\d+h\d*/)) {
      return 'Horaires fixes'
    }

    return 'Autres horaires'
  }

  function getActiveFiltersCount() {
    let count = 0
    if (filters.value.search && filters.value.search.trim()) {
      count++
    }
    if (filters.value.types && filters.value.types.length > 0) {
      count++
    }
    if (filters.value.arrondissements && filters.value.arrondissements.length > 0) {
      count++
    }

    if ('categories' in filters.value && filters.value.categories && filters.value.categories.length > 0) {
      count++
    }
    if ('etats' in filters.value && filters.value.etats && filters.value.etats.length > 0) {
      count++
    }

    return count
  }

  function shouldLoadMoreForFilters(appliedFilters: Partial<F>) {
    const hasSpecificFilters = (appliedFilters.types && appliedFilters.types.length > 0)
      || (appliedFilters.arrondissements && appliedFilters.arrondissements.length > 0)
      || ('categories' in appliedFilters && appliedFilters.categories && appliedFilters.categories.length > 0)
      || ('etats' in appliedFilters && appliedFilters.etats && appliedFilters.etats.length > 0)

    return hasSpecificFilters && loadingMode.value === 'initial'
  }

  async function updateFilters(newFilters: Partial<F>) {
    console.warn(`[${config.storeKey}] Updating filters:`, newFilters)
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1

    if (shouldLoadMoreForFilters(filters.value)) {
      console.warn(`[${config.storeKey}] Specific filter applied, loading more data for better results`)
      await loadMoreData('medium')
    }

    await refresh()
  }

  async function updatePagination(page: number, pageSize?: number) {
    pagination.value.page = page
    if (pageSize) {
      pagination.value.pageSize = pageSize
    }
  }

  function updateSort(field: string, order: 'asc' | 'desc' = 'asc') {
    sortBy.value = field
    sortOrder.value = order
  }

  async function reset() {
    filters.value = { ...config.defaultFilters }
    pagination.value = {
      page: 1,
      pageSize: lazyConfig.initialLoadSize,
    }
    sortBy.value = null
    sortOrder.value = 'asc'
    loadingMode.value = 'initial'
    hasLoadedMore.value = false
    await refresh()
  }

  async function loadMoreData(mode: 'medium' | 'full' = 'medium') {
    if (isLoadingMore.value) {
      return
    }

    if (loadingMode.value === 'full') {
      console.warn(`[${config.storeKey}] Already have full data, no need to load ${mode}`)
      return
    }

    if (loadingMode.value === mode) {
      console.warn(`[${config.storeKey}] Already in ${mode} mode, no need to reload`)
      return
    }

    const newPageSize = mode === 'medium' ? lazyConfig.mediumLoadSize : lazyConfig.fullLoadSize

    console.warn(`[${config.storeKey}] Loading more data: ${mode} mode (${newPageSize} items)`)

    isLoadingMore.value = true
    loadingMode.value = mode
    pagination.value.pageSize = newPageSize
    pagination.value.page = 1

    try {
      await refresh()
      hasLoadedMore.value = true
    }
    finally {
      isLoadingMore.value = false
    }
  }

  const canLoadMore = computed(() => {
    if (loadingMode.value === 'full') {
      return false
    }
    if (loadingMode.value === 'medium' && hasLoadedMore.value) {
      return true
    }
    return loadingMode.value === 'initial'
  })

  const shouldShowLoadMoreButton = computed(() => {
    return canLoadMore.value && !isLoadingMore.value
  })

  // Informations sur les filtres pour l'interface utilisateur
  const filterStatus = computed(() => {
    const activeFiltersCount = getActiveFiltersCount()
    const hasSpecificFilters = activeFiltersCount > 0
    const isLimitedByData = hasSpecificFilters && data.value.length < totalItems.value

    return {
      hasActiveFilters: hasSpecificFilters,
      activeFiltersCount,
      isLimitedByData,
      loadedItems: data.value.length,
      totalAvailable: totalItems.value,
      loadingMode: loadingMode.value,
    }
  })

  function checkFilteredResults() {
    if (!filterStatus.value.hasActiveFilters) {
      return
    }

    const loadedPercentage = (data.value.length / totalItems.value) * 100

    if (loadedPercentage < 30 && loadingMode.value === 'initial' && !isLoadingMore.value) {
      console.warn(`[${config.storeKey}] Auto-loading more data due to very limited results (${loadedPercentage.toFixed(1)}% loaded)`)
      loadMoreData('medium')
    }
    else if (loadedPercentage < 60 && loadingMode.value === 'medium' && !isLoadingMore.value && hasLoadedMore.value) {
      console.warn(`[${config.storeKey}] Auto-loading full data for better filter results (${loadedPercentage.toFixed(1)}% loaded)`)
      loadMoreData('full')
    }
  }

  watch([data, loadingMode, isLoadingMore], () => {
    setTimeout(() => {
      if (!isLoadingMore.value && status.value === 'success') {
        checkFilteredResults()
      }
    }, 500)
  }, { immediate: false })

  const smartLoadSuggestion = computed(() => {
    if (!filterStatus.value.hasActiveFilters) {
      return null
    }

    const loadedPercentage = (data.value.length / totalItems.value) * 100

    if (loadedPercentage < 50 && loadingMode.value === 'initial') {
      return {
        type: 'medium' as const,
        reason: 'Filtres actifs détectés, chargement de plus de données recommandé',
        expectedItems: lazyConfig.mediumLoadSize,
      }
    }

    if (loadedPercentage < 80 && loadingMode.value === 'medium') {
      return {
        type: 'full' as const,
        reason: 'Pour voir tous les résultats filtrés',
        expectedItems: lazyConfig.fullLoadSize,
      }
    }

    return null
  })

  const stateData = reactive({
    data: computed(() => data.value),
    filters,
    loading: computed(() => loading.value),
    error: computed(() => error.value?.message || null),
    pagination: computed(() => ({
      ...pagination.value,
      total: totalItems.value,
    })),
    sortBy,
    sortOrder,
    isLoaded: computed(() => isLoaded.value),
  })

  // Computed séparé pour éviter les problèmes de proxy Pinia
  const filteredData = computed(() => data.value)

  return {
    ...toRefs(stateData),
    filteredData,

    data,
    currentPageData,
    totalPages,
    filterOptions,

    status,
    error,

    loadingMode: readonly(loadingMode),
    isLoadingMore: readonly(isLoadingMore),
    hasLoadedMore: readonly(hasLoadedMore),
    canLoadMore,
    shouldShowLoadMoreButton,
    loadMoreData,

    filterStatus,
    smartLoadSuggestion,

    isLoadingOptions: readonly(isLoadingOptions),
    optionsLoaded: readonly(optionsLoaded),
    loadAllDataForOptions,

    updateFilters,
    updatePagination,
    updateSort,
    reset,
    refresh,
    clear,

    fetchAll: refresh,
    fetchPage: (page: number) => updatePagination(page),
    applyFilters: () => {},
  }
}
