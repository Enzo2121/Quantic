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
  initialLoadSize: number
  mediumLoadSize: number
  fullLoadSize: number
  autoLoadOnSearch: boolean
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
  const lazyConfig = {
    initialLoadSize: 20,
    mediumLoadSize: 200,
    fullLoadSize: 1500,
    autoLoadOnSearch: true,
    ...config.lazyLoading,
  }

  const filters = ref<F>({ ...config.defaultFilters })
  const pagination = ref({
    page: 1,
    pageSize: lazyConfig.initialLoadSize,
  })
  const sortBy = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const loadingMode = ref<'initial' | 'medium' | 'full'>('initial')
  const isLoadingMore = ref(false)
  const hasLoadedMore = ref(false)

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
      return []
    }
    
    const uniqueRecords = new Map<string, T>()
    
    apiResponse.value.records.forEach((record) => {
      const uniqueKey = `${record.id || record.nom}_${record.type}_${record.adresse}`
      if (!uniqueRecords.has(uniqueKey)) {
        uniqueRecords.set(uniqueKey, record)
      }
    })
    
    const sorted = Array.from(uniqueRecords.values())

    if (sortBy.value) {
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

    return sorted
  })

  const currentPageData = computed(() => {
    const allData = data.value
    const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
    const endIndex = startIndex + pagination.value.pageSize
    
    return allData.slice(startIndex, endIndex)
  })

  async function loadAllDataForOptions() {
    if (optionsLoaded.value || isLoadingOptions.value) {
      return
    }

    isLoadingOptions.value = true

    try {
      const allData = await $fetch<{ records: T[], nhits: number }>(config.endpoint, {
        query: {
          page: 1,
          pageSize: Math.min(500, lazyConfig.fullLoadSize),
        },
      })

      allDataForOptions.value = allData.records || []
      optionsLoaded.value = true
    }
    catch (error) {
      if (data.value.length > 0) {
        allDataForOptions.value = data.value
        optionsLoaded.value = true
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

  const isLoading = computed(() => status.value === 'pending')
  const isLoaded = computed(() => status.value === 'success' && data.value.length > 0)

  const filterOptions = computed(() => {
    const dataSource = optionsLoaded.value ? allDataForOptions.value : data.value

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
    })

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
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1

    if (shouldLoadMoreForFilters(filters.value)) {
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
      return
    }

    if (loadingMode.value === mode) {
      return
    }

    const newPageSize = mode === 'medium' ? lazyConfig.mediumLoadSize : lazyConfig.fullLoadSize

    isLoadingMore.value = true
    loadingMode.value = mode

    try {
      // Mettre à jour la taille de page et rafraîchir
      pagination.value.pageSize = newPageSize
      pagination.value.page = 1
      
      await refresh()
      
      hasLoadedMore.value = true
    }
    catch (error) {
      // Production: silent error handling
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
      loadMoreData('medium')
    }
    else if (loadedPercentage < 60 && loadingMode.value === 'medium' && !isLoadingMore.value && hasLoadedMore.value) {
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

  return {
    filters,
    loading: computed(() => isLoading.value),
    error: computed(() => error.value?.message || null),
    pagination: computed(() => ({
      ...pagination.value,
      total: totalItems.value,
    })),
    sortBy,
    sortOrder,
    isLoaded: computed(() => isLoaded.value),
    
    data: computed(() => data.value),
    filteredData: computed(() => data.value),
    currentPageData,
    totalPages,
    filterOptions,

    status,

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
  }
}
