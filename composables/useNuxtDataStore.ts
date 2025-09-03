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

export interface NuxtDataStoreConfig<T extends BaseDataItem, F extends BaseFilters> {
  endpoint: string
  defaultFilters: F
  filterFields: (keyof F)[]
  storeKey: string
}

export function useNuxtDataStore<T extends BaseDataItem, F extends BaseFilters>(
  config: NuxtDataStoreConfig<T, F>
) {
  const filters = ref<F>({ ...config.defaultFilters })
  const pagination = ref({
    page: 1,
    pageSize: 20
  })
  const sortBy = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const { 
    data: apiResponse, 
    status, 
    error, 
    refresh,
    clear
  } = useFetch<{ records: T[], nhits: number, parameters: any }>(config.endpoint, {
    key: config.storeKey,

    query: {
      page: computed(() => pagination.value.page),
      pageSize: computed(() => pagination.value.pageSize),
      search: computed(() => filters.value.search),
      types: computed(() => filters.value.types.join(',')),
      arrondissements: computed(() => filters.value.arrondissements.join(',')),
    },

    server: true, 
    lazy: false, 
    dedupe: 'cancel', 

    default: () => ({ records: [], nhits: 0, parameters: {} }),

  })

  const data = computed<T[]>(() => {
    if (!apiResponse.value?.records) {
      return []
    }

    const sorted = [...apiResponse.value.records]

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

  const currentPageData = computed(() => data.value)

  const totalItems = computed(() => apiResponse.value?.nhits || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

  const loading = computed(() => status.value === 'pending')
  const isLoaded = computed(() => status.value === 'success' && data.value.length > 0)

  const filterOptions = computed(() => {
    const options: Record<string, SelectOption[]> = {}

    config.filterFields.forEach((field) => {
      const fieldMap = new Map<string, number>()

      data.value.forEach((item) => {
        const value = (item as any)[field]
        if (value && typeof value === 'string') {
          fieldMap.set(value, (fieldMap.get(value) || 0) + 1)
        }
      })

      options[field as string] = Array.from(fieldMap.entries())
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })

    return options
  })

  async function updateFilters(newFilters: Partial<F>) {
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1
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
      total: totalItems.value
    })),
    sortBy,
    sortOrder,
    isLoaded: computed(() => isLoaded.value)
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

