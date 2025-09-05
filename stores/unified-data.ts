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
    pageSize: 100, 
    total: 0,
  })
  const sort = ref({
    sortBy: null as string | null,
    sortOrder: 'asc' as 'asc' | 'desc',
  })
  const filterOptions = ref<Record<string, SelectOption[]>>({})
  const isLoaded = ref(false)
  
  // Données des stores individuels
  const equipements = ref<any[]>([])
  const espacesVerts = ref<any[]>([])
  const fontaines = ref<any[]>([])

  // Références aux stores individuels
  const equipementsStore = useEquipementsSportifsStore()
  const espacesVertsStore = useEspacesVertsStore()
  const fontainesStore = useFontainesStore()

  // Fonction pour transformer les données individuelles en format unifié
  function transformToUnified(): UnifiedDataItem[] {
    const unifiedData: UnifiedDataItem[] = []

    // Transformer équipements sportifs
    if (filters.value.sources.includes('equipements')) {
      equipements.value.forEach(item => {
        unifiedData.push({
          id: `equipements_${item.id}`,
          nom: item.nom,
          type: item.type,
          adresse: item.adresse,
          arrondissement: item.arrondissement,
          latitude: item.latitude,
          longitude: item.longitude,
          source: 'equipements',
          sourceType: item.type,
          payant: item.payant,
          horaires: item.horaires,
        })
      })
    }

    if (filters.value.sources.includes('espaces-verts')) {
      espacesVerts.value.forEach(item => {
        unifiedData.push({
          id: `espaces-verts_${item.id}`,
          nom: item.nom,
          type: item.type,
          adresse: item.adresse,
          arrondissement: item.arrondissement,
          latitude: item.latitude,
          longitude: item.longitude,
          source: 'espaces-verts',
          sourceType: item.type,
          categorie: item.categorie,
          superficie: item.superficie,
          ouvert_24h: item.ouvert_24h,
          canicule_ouverture: item.canicule_ouverture,
          horaires: item.ouvert_24h === 'Oui' ? 'Ouvert 24h/24' : 'Horaires normaux',
        })
      })
    }

    if (filters.value.sources.includes('fontaines')) {
      fontaines.value.forEach(item => {
        unifiedData.push({
          id: `fontaines_${item.id}`,
          nom: item.nom,
          type: item.type,
          adresse: item.adresse,
          arrondissement: item.arrondissement,
          latitude: item.latitude,
          longitude: item.longitude,
          source: 'fontaines',
          sourceType: item.type,
          etat: item.etat,
        })
      })
    }

    return unifiedData
  }

  function applyFilters(dataToFilter: UnifiedDataItem[]): UnifiedDataItem[] {
    let filtered = [...dataToFilter]

    if (filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.nom.toLowerCase().includes(searchTerm) ||
        item.adresse.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.arrondissement.toLowerCase().includes(searchTerm)
      )
    }

    // Filtre par types
    if (filters.value.types.length > 0) {
      filtered = filtered.filter(item =>
        filters.value.types.includes(item.type)
      )
    }

    // Filtre par arrondissements
    if (filters.value.arrondissements.length > 0) {
      filtered = filtered.filter(item =>
        filters.value.arrondissements.includes(item.arrondissement)
      )
    }

    // Filtre par catégories (espaces verts uniquement)
    if (filters.value.categories.length > 0) {
      filtered = filtered.filter(item =>
        !item.categorie || filters.value.categories.includes(item.categorie)
      )
    }

    // Filtre par états (fontaines uniquement)
    if (filters.value.etats.length > 0) {
      filtered = filtered.filter(item =>
        !item.etat || filters.value.etats.includes(item.etat)
      )
    }

    // Filtre par tarifs (équipements uniquement)
    if (filters.value.tarifs.length > 0) {
      filtered = filtered.filter(item =>
        !item.payant || filters.value.tarifs.includes(item.payant)
      )
    }

    // Filtre par horaires
    if (filters.value.horaires.length > 0) {
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
    loading.value = true
    error.value = null

    try {
      // Forcer le chargement complet de tous les stores
      const promises = []

      // Charger TOUTES les données des équipements sportifs
      if (!equipementsStore.isLoaded || equipementsStore.loadingMode !== 'full') {
        promises.push(equipementsStore.loadMoreData('full'))
      }
      
      // Charger TOUTES les données des espaces verts
      if (!espacesVertsStore.isLoaded || espacesVertsStore.loadingMode !== 'full') {
        promises.push(espacesVertsStore.loadMoreData('full'))
      }
      
      // Charger TOUTES les données des fontaines
      if (!fontainesStore.isLoaded || fontainesStore.loadingMode !== 'full') {
        promises.push(fontainesStore.loadMoreData('full'))
      }

      await Promise.all(promises)

      // Récupérer TOUTES les données transformées (pas seulement la page courante)
      equipements.value = equipementsStore.data
      espacesVerts.value = espacesVertsStore.data
      fontaines.value = fontainesStore.data

      console.log(`[UnifiedStore] Données chargées:`, {
        equipements: equipements.value.length,
        espacesVerts: espacesVerts.value.length,
        fontaines: fontaines.value.length
      })

      // Transformer et filtrer les données
      data.value = transformToUnified()
      filteredData.value = applyFilters(data.value)
      pagination.value.total = filteredData.value.length

      console.log(`[UnifiedStore] Total unifié: ${data.value.length}, Filtré: ${filteredData.value.length}`)

      isLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement'
      console.error('Erreur dans useUnifiedDataStore:', err)
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

    // Types (tous datasets confondus)
    const typesMap = new Map<string, number>()
    data.value.forEach(item => {
      const type = item.type
      typesMap.set(type, (typesMap.get(type) || 0) + 1)
    })
    options.types = Array.from(typesMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))

    // Arrondissements
    const arrondissementsMap = new Map<string, number>()
    data.value.forEach(item => {
      const arr = item.arrondissement
      arrondissementsMap.set(arr, (arrondissementsMap.get(arr) || 0) + 1)
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
      .sort((a, b) => a.label.localeCompare(b.label))

    // États (fontaines)
    const etatsMap = new Map<string, number>()
    data.value.filter(item => item.source === 'fontaines' && item.etat).forEach(item => {
      const etat = item.etat!
      etatsMap.set(etat, (etatsMap.get(etat) || 0) + 1)
    })
    options.etats = Array.from(etatsMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))

    // Tarifs (équipements)
    const tarifsMap = new Map<string, number>()
    data.value.filter(item => item.source === 'equipements' && item.payant).forEach(item => {
      const tarif = item.payant!
      tarifsMap.set(tarif, (tarifsMap.get(tarif) || 0) + 1)
    })
    options.tarifs = Array.from(tarifsMap.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label))

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
  const paginatedData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredData.value.slice(start, end)
  })

  const computedTotalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.pageSize)
  )

  // Watcher pour recalculer les options quand les données changent
  watch(data, () => {
    calculateFilterOptions()
  }, { immediate: true })

  return {
    // État - Reactive refs
    data,
    filteredData,
    filters,
    loading,
    error,
    pagination,
    sort,
    filterOptions,
    isLoaded,
    equipements,
    espacesVerts,
    fontaines,
    
    // Computed - with different names to avoid conflicts
    currentPageData: paginatedData,
    totalPages: computedTotalPages,
    
    // Actions
    loadAllData,
    updateFilters,
    reset,
    calculateFilterOptions,
  }
})