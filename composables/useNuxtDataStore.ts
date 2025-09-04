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

export interface NuxtDataStoreConfig<_T extends BaseDataItem, F extends BaseFilters> {
  endpoint: string
  defaultFilters: F
  filterFields: (keyof F)[]
  storeKey: string
}

export function useNuxtDataStore<T extends BaseDataItem, F extends BaseFilters>(
  config: NuxtDataStoreConfig<T, F>,
) {
  const filters = ref<F>({ ...config.defaultFilters })
  const pagination = ref({
    page: 1,
    pageSize: 20,
  })
  const sortBy = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

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

      // Ajouter la recherche si elle n'est pas vide
      if (filters.value.search) {
        query.search = filters.value.search
      }

      // Ajouter les filtres actifs
      if (filters.value.types && filters.value.types.length > 0) {
        query.types = filters.value.types
      }

      if (filters.value.arrondissements && filters.value.arrondissements.length > 0) {
        query.arrondissements = filters.value.arrondissements
      }

      // Gestion des filtres spécifiques selon le type de données
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

  const totalItems = computed(() => apiResponse.value?.nhits || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

  const loading = computed(() => status.value === 'pending')
  const isLoaded = computed(() => status.value === 'success' && data.value.length > 0)

  const filterOptions = computed(() => {
    console.log(`[${config.storeKey}] Calculating filterOptions from ${data.value.length} records`)
    const options: Record<string, SelectOption[]> = {}

    config.filterFields.forEach((field) => {
      const fieldMap = new Map<string, number>()

      data.value.forEach((item) => {
        // Map filter field names to actual item property names
        const propertyName = field === 'types' ? 'type'
                         : field === 'arrondissements' ? 'arrondissement'
                         : field === 'categories' ? 'categorie'
                         : field === 'etats' ? 'etat'
                         : field as string

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
      console.log(`[${config.storeKey}] Field ${field}: ${fieldOptions.length} options`)
    })

    console.log(`[${config.storeKey}] FilterOptions calculated:`, Object.keys(options))
    return options
  })

  async function updateFilters(newFilters: Partial<F>) {
    console.log(`[${config.storeKey}] Updating filters:`, newFilters)
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1

    // Forcer un refresh pour appliquer les nouveaux filtres
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
    sortBy.value = null
    sortOrder.value = 'asc'
  }

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
