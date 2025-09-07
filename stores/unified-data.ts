import type { UnifiedDataItem, UnifiedFilters, SelectOption } from '~/types/datasets'

export const useUnifiedDataStore = defineStore('unified-data', () => {
  const data = ref<UnifiedDataItem[]>([])
  const filteredData = ref<UnifiedDataItem[]>([])
  const filters = ref<UnifiedFilters>({
    search: '',
    sources: ['equipements', 'espaces-verts', 'fontaines'],
    types: [],
    arrondissements: [],
    categories: [],
    etats: [],
    tarifs: [],
    horaires: [],
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
  })
  const sort = ref({
    sortBy: null as string | null,
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const filterOptions = ref<Record<string, SelectOption[]>>({})
  const isLoaded = ref(false)
  
  // Références aux stores individuels
  const equipementsStore = useEquipementsSportifsStore()
  const espacesVertsStore = useEspacesVertsStore()
  const fontainesStore = useFontainesStore()

  // Fonction pour transformer les données individuelles en format unifié
  function transformToUnified(): UnifiedDataItem[] {
    const unifiedData: UnifiedDataItem[] = []

    // Transformer équipements sportifs
    if (filters.value.sources.includes('equipements')) {
      const equipementsData = equipementsStore.data || []
      equipementsData.forEach(item => {
        unifiedData.push({
          id: `equipements_${item.id || item.recordid}`,
          nom: item.nom || item.name || '',
          type: item.type || '',
          adresse: item.adresse || item.address || '',
          arrondissement: item.arrondissement || '',
          latitude: item.latitude || item.lat,
          longitude: item.longitude || item.lng,
          source: 'equipements',
          sourceType: item.type || '',
          payant: item.payant,
          horaires: item.horaires,
        })
      })
    }

    // Transformer espaces verts
    if (filters.value.sources.includes('espaces-verts')) {
      const espacesData = espacesVertsStore.data || []
      espacesData.forEach(item => {
        unifiedData.push({
          id: `espaces-verts_${item.id || item.recordid}`,
          nom: item.nom || item.name || '',
          type: item.type || '',
          adresse: item.adresse || item.address || '',
          arrondissement: item.arrondissement || '',
          latitude: item.latitude || item.lat,
          longitude: item.longitude || item.lng,
          source: 'espaces-verts',
          sourceType: item.type || '',
          categorie: item.categorie,
          superficie: item.superficie,
          ouvert_24h: item.ouvert_24h,
          canicule_ouverture: item.canicule_ouverture,
          horaires: item.ouvert_24h === 'Oui' ? 'Ouvert 24h/24' : 'Horaires normaux',
        })
      })
    }

    // Transformer fontaines
    if (filters.value.sources.includes('fontaines')) {
      const fontainesData = fontainesStore.data || []
      fontainesData.forEach(item => {
        unifiedData.push({
          id: `fontaines_${item.id || item.recordid}`,
          nom: item.nom || item.name || '',
          type: item.type || '',
          adresse: item.adresse || item.address || '',
          arrondissement: item.arrondissement || '',
          latitude: item.latitude || item.lat,
          longitude: item.longitude || item.lng,
          source: 'fontaines',
          sourceType: item.type || '',
          etat: item.etat,
        })
      })
    }

    return unifiedData
  }

  function applyFilters(dataToFilter: UnifiedDataItem[]): UnifiedDataItem[] {
    let filtered = [...dataToFilter]

    // Filtre par recherche
    if (filters.value.search && filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(item =>
        (item.nom && item.nom.toLowerCase().includes(searchTerm)) ||
        (item.adresse && item.adresse.toLowerCase().includes(searchTerm)) ||
        (item.type && item.type.toLowerCase().includes(searchTerm)) ||
        (item.arrondissement && item.arrondissement.toLowerCase().includes(searchTerm))
      )
    }

    // Filtre par sources
    if (filters.value.sources && filters.value.sources.length > 0) {
      filtered = filtered.filter(item =>
        filters.value.sources.includes(item.source)
      )
    }

    // Filtre par types
    if (filters.value.types && filters.value.types.length > 0) {
      filtered = filtered.filter(item =>
        filters.value.types.includes(item.type)
      )
    }

    // Filtre par arrondissements
    if (filters.value.arrondissements && filters.value.arrondissements.length > 0) {
      filtered = filtered.filter(item =>
        filters.value.arrondissements.includes(item.arrondissement)
      )
    }

    // Filtre par catégories (espaces verts uniquement)
    if (filters.value.categories && filters.value.categories.length > 0) {
      filtered = filtered.filter(item =>
        item.source !== 'espaces-verts' || !item.categorie || filters.value.categories.includes(item.categorie)
      )
    }

    // Filtre par états (fontaines uniquement)
    if (filters.value.etats && filters.value.etats.length > 0) {
      filtered = filtered.filter(item =>
        item.source !== 'fontaines' || !item.etat || filters.value.etats.includes(item.etat)
      )
    }

    // Filtre par tarifs (équipements uniquement)
    if (filters.value.tarifs && filters.value.tarifs.length > 0) {
      filtered = filtered.filter(item =>
        item.source !== 'equipements' || !item.payant || filters.value.tarifs.includes(item.payant)
      )
    }

    // Filtre par horaires
    if (filters.value.horaires && filters.value.horaires.length > 0) {
      filtered = filtered.filter(item =>
        !item.horaires || filters.value.horaires.some(h => 
          item.horaires?.includes(h) || 
          (h === 'Ouvert 24h/24' && item.ouvert_24h === 'Oui')
        )
      )
    }

    return filtered
  }

  // Fonction pour charger toutes les données
  async function loadAllData() {
    if (loading.value) return
    
    loading.value = true
    error.value = null

    try {
      // S'assurer que tous les stores sont disponibles
      await nextTick()
      
      // Forcer le chargement des données depuis les stores individuels
      await equipementsStore.loadMoreData('full')
      
      await espacesVertsStore.loadMoreData('full')
      
      await fontainesStore.loadMoreData('full')

      // Attendre un peu pour s'assurer que les données sont disponibles
      await nextTick()

      // Transformer et unifier les données
      const allData = transformToUnified()
      
      // Afficher le détail par source
      const equipementsCount = allData.filter(item => item.source === 'equipements').length
      const espacesCount = allData.filter(item => item.source === 'espaces-verts').length
      const fontainesCount = allData.filter(item => item.source === 'fontaines').length
      
      data.value = allData

      // Appliquer les filtres
      filteredData.value = applyFilters(data.value)
      pagination.value.total = filteredData.value.length

      // Calculer les options de filtres
      calculateFilterOptions()

      isLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des données'
      // Production: silent error handling
    } finally {
      loading.value = false
    }
  }

  // Fonction pour mettre à jour les filtres
  async function updateFilters(newFilters: Partial<UnifiedFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1

    // Reappliquer les filtres
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
  }

  // Fonction pour calculer les options de filtres dynamiquement
  function calculateFilterOptions() {
    const options: Record<string, SelectOption[]> = {}

    if (data.value.length === 0) {
      filterOptions.value = options
      return
    }

    // Types (tous datasets confondus)
    const typesMap = new Map<string, number>()
    data.value.forEach(item => {
      if (item.type) {
        const type = item.type
        typesMap.set(type, (typesMap.get(type) || 0) + 1)
      }
    })
    options.types = Array.from(typesMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count)

    // Arrondissements
    const arrondissementsMap = new Map<string, number>()
    data.value.forEach(item => {
      if (item.arrondissement) {
        const arr = item.arrondissement
        arrondissementsMap.set(arr, (arrondissementsMap.get(arr) || 0) + 1)
      }
    })
    options.arrondissements = Array.from(arrondissementsMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))

    // Catégories (espaces verts)
    const categoriesMap = new Map<string, number>()
    data.value.filter(item => item.source === 'espaces-verts' && item.categorie).forEach(item => {
      const cat = item.categorie!
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1)
    })
    options.categories = Array.from(categoriesMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count)

    // États (fontaines)
    const etatsMap = new Map<string, number>()
    data.value.filter(item => item.source === 'fontaines' && item.etat).forEach(item => {
      const etat = item.etat!
      etatsMap.set(etat, (etatsMap.get(etat) || 0) + 1)
    })
    options.etats = Array.from(etatsMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count)

    // Tarifs (équipements)
    const tarifsMap = new Map<string, number>()
    data.value.filter(item => item.source === 'equipements' && item.payant).forEach(item => {
      const tarif = item.payant!
      tarifsMap.set(tarif, (tarifsMap.get(tarif) || 0) + 1)
    })
    options.tarifs = Array.from(tarifsMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count)

    // Horaires
    const horairesMap = new Map<string, number>()
    data.value.forEach(item => {
      if (item.horaires) {
        horairesMap.set(item.horaires, (horairesMap.get(item.horaires) || 0) + 1)
      }
    })
    options.horaires = Array.from(horairesMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count)

    filterOptions.value = options
  }

  // Fonction pour réinitialiser les filtres
  function reset() {
    filters.value = {
      search: '',
      sources: ['equipements', 'espaces-verts', 'fontaines'],
      types: [],
      arrondissements: [],
      categories: [],
      etats: [],
      tarifs: [],
      horaires: [],
    }
    pagination.value.page = 1
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
  }

  // Computed pour les données paginées
  const currentPageData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredData.value.slice(start, end)
  })

  const totalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.pageSize)
  )

  // Watcher pour recalculer les options quand les données changent
  watch(data, () => {
    if (data.value.length > 0) {
      calculateFilterOptions()
    }
  }, { immediate: true })

  // Watcher pour les filtres
  watch(filters, () => {
    filteredData.value = applyFilters(data.value)
    pagination.value.total = filteredData.value.length
    pagination.value.page = 1
  }, { deep: true })

  return {
    // État - Reactive refs
    data: readonly(data),
    filteredData: readonly(filteredData),
    filters,
    loading: readonly(loading),
    error: readonly(error),
    pagination,
    sort,
    filterOptions: readonly(filterOptions),
    isLoaded: readonly(isLoaded),
    
    // Computed
    currentPageData,
    totalPages,
    
    // Actions
    loadAllData,
    updateFilters,
    reset,
    calculateFilterOptions,
  }
})