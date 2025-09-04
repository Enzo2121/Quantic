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
  lazyLoading?: Partial<LazyLoadingConfig>,
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
    ...config.lazyLoading
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
      console.log(`[${config.storeKey}] No records in API response`)
      return []
    }

    console.log(`[${config.storeKey}] Processing ${apiResponse.value.records.length} records`)
    const sorted = [...apiResponse.value.records]

    if (sortBy.value) {
      console.log(`[${config.storeKey}] Sorting by ${sortBy.value} (${sortOrder.value})`)
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

    console.log(`[${config.storeKey}] Final data: ${sorted.length} records`)
    return sorted
  })

  const currentPageData = computed(() => data.value)

  async function loadAllDataForOptions() {
    if (optionsLoaded.value || isLoadingOptions.value) return

    isLoadingOptions.value = true
    console.log(`[${config.storeKey}] Loading all data for filter options...`)

    try {
      const allData = await $fetch<{ records: T[], nhits: number }>(config.endpoint, {
        query: {
          page: 1,
          pageSize: Math.min(500, lazyConfig.fullLoadSize),
        }
      })

      allDataForOptions.value = allData.records || []
      optionsLoaded.value = true

      console.log(`[${config.storeKey}] Loaded ${allDataForOptions.value.length} records for options`)
    } catch (error) {
      console.error(`[${config.storeKey}] Error loading options data:`, error)
      if (data.value.length > 0) {
        allDataForOptions.value = data.value
        optionsLoaded.value = true
        console.log(`[${config.storeKey}] Using current data as fallback for options`)
      }
    } finally {
      isLoadingOptions.value = false
    }
  }

  onMounted(async () => {
    await loadAllDataForOptions()
  })

  const totalItems = computed(() => apiResponse.value?.nhits || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

  const loading = computed(() => status.value === 'pending')
  const isLoaded = computed(() => status.value === 'success' && data.value.length > 0)

  const filterOptions = computed(() => {
    const dataSource = optionsLoaded.value ? allDataForOptions.value : data.value
    console.log(`[${config.storeKey}] Calculating filterOptions from ${dataSource.length} records (${optionsLoaded.value ? 'complete' : 'partial'} data)`)

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
          : String(field)

        const value = (item as any)[propertyName]
        if (value && typeof value === 'string') {
          fieldMap.set(value, (fieldMap.get(value) || 0) + 1)
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
      console.log(`[${config.storeKey}] Field ${String(field)}: ${fieldOptions.length} options`)
    })

    console.log(`[${config.storeKey}] FilterOptions calculated:`, Object.keys(options))
    return options
  })

  function getActiveFiltersCount() {
    let count = 0
    if (filters.value.search && filters.value.search.trim()) count++
    if (filters.value.types && filters.value.types.length > 0) count++
    if (filters.value.arrondissements && filters.value.arrondissements.length > 0) count++

    if ('categories' in filters.value && filters.value.categories && filters.value.categories.length > 0) count++
    if ('etats' in filters.value && filters.value.etats && filters.value.etats.length > 0) count++

    return count
  }

  function shouldLoadMoreForFilters(appliedFilters: Partial<F>) {
    const hasSpecificFilters = (appliedFilters.types && appliedFilters.types.length > 0) ||
                              (appliedFilters.arrondissements && appliedFilters.arrondissements.length > 0) ||
                              ('categories' in appliedFilters && appliedFilters.categories && appliedFilters.categories.length > 0) ||
                              ('etats' in appliedFilters && appliedFilters.etats && appliedFilters.etats.length > 0)

    return hasSpecificFilters && loadingMode.value === 'initial'
  }

  async function updateFilters(newFilters: Partial<F>) {
    console.log(`[${config.storeKey}] Updating filters:`, newFilters)
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1

    if (newFilters.search && lazyConfig.autoLoadOnSearch) {
      if (loadingMode.value === 'initial') {
        await loadMoreData('medium')
        return
      }
    }

    if (shouldLoadMoreForFilters(newFilters)) {
      console.log(`[${config.storeKey}] Specific filter applied, loading more data for better results`)
      await loadMoreData('medium')
      return
    }

    await refresh()
  }

  async function updatePagination(page: number, pageSize?: number) {
    pagination.value.page = page
    if (pageSize) {
      pagination.value.pageSize = pageSize
      pagination.value.page = 1
    }
  }

  function updateSort(field: string, order: 'asc' | 'desc' = 'asc') {
    sortBy.value = field
    sortOrder.value = order
  }

  async function reset() {
    filters.value = { ...config.defaultFilters }
    pagination.value.page = 1
    pagination.value.pageSize = lazyConfig.initialLoadSize
    sortBy.value = null
    sortOrder.value = 'asc'
    loadingMode.value = 'initial'
    hasLoadedMore.value = false
  }

  async function loadMoreData(mode: 'medium' | 'full' = 'medium') {
    if (isLoadingMore.value) return

    if (loadingMode.value === 'full' && mode === 'medium') {
      console.log(`[${config.storeKey}] Already have full data, no need to load ${mode}`)
      return
    }

    if (loadingMode.value === mode) {
      console.log(`[${config.storeKey}] Already in ${mode} mode, no need to reload`)
      return
    }

    isLoadingMore.value = true
    const newPageSize = mode === 'medium' ? lazyConfig.mediumLoadSize : lazyConfig.fullLoadSize

    console.log(`[${config.storeKey}] Loading more data: ${mode} mode (${newPageSize} items)`)

    try {
      pagination.value.pageSize = newPageSize
      pagination.value.page = 1
      loadingMode.value = mode
      hasLoadedMore.value = true

      await refresh()
    } finally {
      isLoadingMore.value = false
    }
  }

  const canLoadMore = computed(() => {
    if (loadingMode.value === 'full') return false
    if (loadingMode.value === 'medium' && hasLoadedMore.value) return true
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
      loadingMode: loadingMode.value
    }
  })

  function checkFilteredResults() {
    if (!filterStatus.value.hasActiveFilters) return

    const loadedPercentage = (data.value.length / totalItems.value) * 100

    if (loadedPercentage < 30 && loadingMode.value === 'initial' && !isLoadingMore.value) {
      console.log(`[${config.storeKey}] Auto-loading more data due to very limited results (${loadedPercentage.toFixed(1)}% loaded)`)
      loadMoreData('medium')
    }
    else if (loadedPercentage < 60 && loadingMode.value === 'medium' && !isLoadingMore.value && hasLoadedMore.value) {
      console.log(`[${config.storeKey}] Auto-loading full data for better filter results (${loadedPercentage.toFixed(1)}% loaded)`)
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
    if (!filterStatus.value.hasActiveFilters) return null

    const loadedPercentage = (data.value.length / totalItems.value) * 100

    if (loadedPercentage < 50 && loadingMode.value === 'initial') {
      return {
        type: 'medium' as const,
        reason: 'Filtres actifs détectés, chargement de plus de données recommandé',
        expectedItems: lazyConfig.mediumLoadSize
      }
    }

    if (loadedPercentage < 80 && loadingMode.value === 'medium') {
      return {
        type: 'full' as const,
        reason: 'Pour voir tous les résultats filtrés',
        expectedItems: lazyConfig.fullLoadSize
      }
    }

    return null
  })

  const stateData = reactive({
    data: computed(() => data.value),
    filteredData: computed(() => data.value),
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

  return {
    ...toRefs(stateData),

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
