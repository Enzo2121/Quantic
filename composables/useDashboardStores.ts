export function useDashboardStores() {
  const equipementsStore = useEquipementsSportifsStore()
  const espacesVertsStore = useEspacesVertsStore()
  const fontainesStore = useFontainesStore()

  const aggregatedStats = computed(() => {
    if (!equipementsStore.isLoaded && !espacesVertsStore.isLoaded && !fontainesStore.isLoaded) {
      return null
    }

    return {
      total: (equipementsStore.pagination?.total || 0) +
        (espacesVertsStore.pagination?.total || 0) +
        (fontainesStore.pagination?.total || 0),
      breakdown: {
        sports: equipementsStore.pagination?.total || 0,
        parks: espacesVertsStore.pagination?.total || 0,
        fountains: fontainesStore.pagination?.total || 0,
      }
    }
  })

  const stats = computed(() => ({
    equipements: {
      total: equipementsStore.pagination.total || 0,
      isLoaded: equipementsStore.isLoaded,
    },
    espacesVerts: {
      total: espacesVertsStore.pagination.total || 0,
      isLoaded: espacesVertsStore.isLoaded,
    },
    fontaines: {
      total: fontainesStore.pagination.total || 0,
      isLoaded: fontainesStore.isLoaded,
    },
  }))

  const initializeStores = async () => {
    try {
      if (!equipementsStore.isLoaded) {
        await equipementsStore.fetchPage(1)
        console.log('Équipements chargés:', equipementsStore.currentPageData.length)
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des stores:', error)
    }
  }

  const loadStoreData = async (storeType: 'equipements' | 'espaces-verts' | 'fontaines') => {
    try {
      switch (storeType) {
        case 'equipements':
          if (!equipementsStore.isLoaded) {
            await equipementsStore.fetchPage(1)
          }
          break
        case 'espaces-verts':
          if (!espacesVertsStore.isLoaded) {
            await espacesVertsStore.fetchPage(1)
          }
          break
        case 'fontaines':
          if (!fontainesStore.isLoaded) {
            await fontainesStore.fetchPage(1)
          }
          break
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ${storeType}:`, error)
    }
  }

  return {
    equipementsStore,
    espacesVertsStore,
    fontainesStore,

    aggregatedStats,
    stats,

    initializeStores,
    loadStoreData,
  }
}

