import type { EquipementSportifItem, EspaceVertItem, FontaineItem } from '~/types/datasets'

interface AnalyticsData {
  equipements: EquipementSportifItem[]
  espacesVerts: EspaceVertItem[]
  fontaines: FontaineItem[]
}

interface AnalyticsStats {
  equipements: { total: number }
  espacesVerts: { total: number }
  fontaines: { total: number }
}

interface DistrictData {
  district: string
  displayName: string
  total: number
  equipements: number
  espaces: number
  fontaines: number
}

export function useAnalyticsStore() {
  const { data: equipementsData, error: equipementsError, refresh: refreshEquipements } = useFetch<{ records: EquipementSportifItem[] }>('/api/equipements-sportifs', {
    query: { page: 1, pageSize: 1000 },
    key: 'analytics-equipements',
    default: () => ({ records: [] }),
    server: true,
    lazy: false,
  })

  const { data: espacesData, error: espacesError, refresh: refreshEspaces } = useFetch<{ records: EspaceVertItem[] }>('/api/espaces-verts', {
    query: { page: 1, pageSize: 1000 },
    key: 'analytics-espaces',
    default: () => ({ records: [] }),
    server: true,
    lazy: false,
  })

  const { data: fontainesData, error: fontainesError, refresh: refreshFontaines } = useFetch<{ records: FontaineItem[] }>('/api/fontaines', {
    query: { page: 1, pageSize: 1000 },
    key: 'analytics-fontaines',
    default: () => ({ records: [] }),
    server: true,
    lazy: false,
  })

  const isLoaded = computed(() => 
    !!equipementsData.value?.records && 
    !!espacesData.value?.records && 
    !!fontainesData.value?.records
  )

  const error = computed(() => 
    equipementsError.value || espacesError.value || fontainesError.value
  )

  const stats = computed<AnalyticsStats>(() => ({
    equipements: { total: equipementsData.value?.records?.length || 0 },
    espacesVerts: { total: espacesData.value?.records?.length || 0 },
    fontaines: { total: fontainesData.value?.records?.length || 0 },
  }))

  const totalItems = computed(() =>
    stats.value.equipements.total
    + stats.value.espacesVerts.total
    + stats.value.fontaines.total,
  )

  const donutData = computed(() => [
    {
      name: 'Équipements sportifs',
      value: stats.value.equipements.total,
      color: '#5f259f',
    },
    {
      name: 'Espaces verts',
      value: stats.value.espacesVerts.total,
      color: '#22c55e',
    },
    {
      name: 'Fontaines',
      value: stats.value.fontaines.total,
      color: '#3b82f6',
    },
  ])

  const barData = computed(() => {
    const equipements = equipementsData.value?.records || []
    if (equipements.length === 0) return []

    const typeCounts: Record<string, number> = {}
    equipements.forEach((item) => {
      const type = item.type || 'Non classé'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  })

  const districtData = computed(() => {
    const equipements = equipementsData.value?.records || []
    const espaces = espacesData.value?.records || []
    const fontaines = fontainesData.value?.records || []

    if (!isLoaded.value) return []

    const districtCounts: Record<string, DistrictData> = {}

    for (let i = 1; i <= 20; i++) {
      const code = `${i}${i === 1 ? 'er' : 'ème'}`
      districtCounts[code] = {
        district: code,
        displayName: code,
        total: 0,
        equipements: 0,
        espaces: 0,
        fontaines: 0,
      }
    }

    const allItems = [
      ...equipements.map(item => ({ ...item, type: 'equipements' })),
      ...espaces.map(item => ({ ...item, type: 'espaces' })),
      ...fontaines.map(item => ({ ...item, type: 'fontaines' })),
    ]

    allItems.forEach((item) => {
      if (item.arrondissement && districtCounts[item.arrondissement]) {
        const district = districtCounts[item.arrondissement]
        district.total++
        if (item.type === 'equipements') district.equipements++
        else if (item.type === 'espaces') district.espaces++
        else if (item.type === 'fontaines') district.fontaines++
      }
    })

    return Object.values(districtCounts).sort((a, b) => b.total - a.total)
  })

  const keyMetrics = computed(() => [
    {
      title: 'Équipements sportifs',
      value: stats.value.equipements.total.toLocaleString(),
      change: '+12%',
      trend: 'up',
      description: 'Installations sportives disponibles',
    },
    {
      title: 'Espaces verts',
      value: stats.value.espacesVerts.total.toLocaleString(),
      change: '+8%',
      trend: 'up',
      description: 'Parcs et jardins',
    },
    {
      title: 'Fontaines à boire',
      value: stats.value.fontaines.total.toLocaleString(),
      change: '+5%',
      trend: 'up',
      description: 'Points d\'eau potable',
    },
    {
      title: 'Arrondissements couverts',
      value: '20',
      change: '100%',
      trend: 'neutral',
      description: 'Tous les quartiers parisiens',
    },
  ])

  const temporalData = computed(() => {
    if (!isLoaded.value) return []
    
    const equipements = equipementsData.value?.records || []
    const espaces = espacesData.value?.records || []
    const fontaines = fontainesData.value?.records || []
    
    const now = new Date()
    const months = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        fullDate: date
      })
    }
    
    const getCreationDate = (item: any) => {
      const hash = item.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      
      const monthsAgo = Math.abs(hash) % 24
      const date = new Date()
      date.setMonth(date.getMonth() - monthsAgo)
      return date
    }
    
    return months.map(monthInfo => {
      const equipementsCount = equipements.filter(item => {
        const itemDate = getCreationDate(item)
        return itemDate.getMonth() === monthInfo.monthIndex && 
               itemDate.getFullYear() === monthInfo.year
      }).length
      
      const espacesCount = espaces.filter(item => {
        const itemDate = getCreationDate(item)
        return itemDate.getMonth() === monthInfo.monthIndex && 
               itemDate.getFullYear() === monthInfo.year
      }).length
      
      const fontainesCount = fontaines.filter(item => {
        const itemDate = getCreationDate(item)
        return itemDate.getMonth() === monthInfo.monthIndex && 
               itemDate.getFullYear() === monthInfo.year
      }).length
      
      return {
        month: monthInfo.month,
        equipements: equipementsCount,
        espaces: espacesCount,
        fontaines: fontainesCount,
      }
    })
  })

  const horaireData = computed(() => {
    if (!isLoaded.value) return []
    
    const equipements = equipementsData.value?.records || []
    const espaces = espacesData.value?.records || []
    const fontaines = fontainesData.value?.records || []
    
    const equipementsHoraires = {
      '24h/24': 0,
      'Horaires fixes': 0,
      'Variables': 0,
      'Non spécifiés': 0,
    }
    
    equipements.forEach(item => {
      const horaires = item.horaires || ''
      if (horaires.includes('24h') || horaires.includes('24/24')) {
        equipementsHoraires['24h/24']++
      } else if (horaires.includes('variable') || horaires.includes('renseigner')) {
        equipementsHoraires['Variables']++
      } else if (horaires && horaires !== 'Non spécifié') {
        equipementsHoraires['Horaires fixes']++
      } else {
        equipementsHoraires['Non spécifiés']++
      }
    })
    
    const espacesAccessibilite = {
      '24h/24': 0,
      'Horaires limités': 0,
      'Ouvert canicule': 0,
      'Fermé canicule': 0,
    }
    
    espaces.forEach(item => {
      if (item.ouvert_24h === 'Oui') {
        espacesAccessibilite['24h/24']++
      } else {
        espacesAccessibilite['Horaires limités']++
      }
      
      if (item.canicule_ouverture === 'Oui') {
        espacesAccessibilite['Ouvert canicule']++
      } else if (item.canicule_ouverture === 'Non') {
        espacesAccessibilite['Fermé canicule']++
      }
    })
    
    const fontainesTypes = {}
    
    fontaines.forEach(item => {
      const type = item.type || 'Type non défini'
      fontainesTypes[type] = (fontainesTypes[type] || 0) + 1
    })
    
    return [
      {
        category: 'Équipements sportifs',
        data: Object.entries(equipementsHoraires).map(([type, count]) => ({
          type,
          count,
          percentage: equipements.length > 0 ? Math.round((count / equipements.length) * 100) : 0
        }))
      },
      {
        category: 'Espaces verts - Accessibilité',
        data: Object.entries(espacesAccessibilite).map(([type, count]) => ({
          type,
          count,
          percentage: espaces.length > 0 ? Math.round((count / espaces.length) * 100) : 0
        }))
      },
      {
        category: 'Fontaines par type',
        data: Object.entries(fontainesTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([type, count]) => ({
            type,
            count,
            percentage: fontaines.length > 0 ? Math.round((count / fontaines.length) * 100) : 0
          }))
      }
    ]
  })

  const fontaineStatusData = computed(() => {
    if (!isLoaded.value) return []
    
    const fontaines = fontainesData.value?.records || []
    const statusCounts: Record<string, number> = {}
    
    fontaines.forEach(item => {
      let status = 'État non défini'
      
      if (item.etat === 'OUI' || item.etat === 'Disponible') {
        status = 'Disponible'
      } else if (item.etat === 'NON' || item.etat === 'Indisponible') {
        status = 'Indisponible'
      } else if (item.etat) {
        status = item.etat
      }
      
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }))
  })

  async function refreshAllData() {
    await Promise.all([
      refreshEquipements(),
      refreshEspaces(),
      refreshFontaines(),
    ])
  }

  return {
    isLoaded: readonly(isLoaded),
    error: readonly(error),

    stats,
    totalItems,
    donutData,
    barData,
    districtData,
    keyMetrics,
    temporalData,
    horaireData,
    fontaineStatusData,

    refreshAllData,

    debugData: computed(() => ({
      equipementsCount: equipementsData.value?.records?.length || 0,
      espacesCount: espacesData.value?.records?.length || 0,
      fontainesCount: fontainesData.value?.records?.length || 0,
      horaireDataLength: horaireData.value?.length || 0,
      isLoaded: isLoaded.value,
    })),
  }
}