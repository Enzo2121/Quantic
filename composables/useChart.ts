import { nextTick, onMounted, ref, computed } from 'vue'

// Couleurs prédéfinies pour les graphiques
export const CHART_COLORS = [
  '#5f259f', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#84cc16'
] as const

// Interface pour les données de graphique
export interface ChartDataItem {
  [key: string]: string | number
}

// Hook optimisé pour les graphiques
export function useChart<T extends ChartDataItem>(options: {
  colors?: string[]
  maxItems?: number
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
} = {}) {
  const {
    colors = CHART_COLORS,
    maxItems = 10,
    sortBy,
    sortOrder = 'desc'
  } = options

  const chartContainer = ref<HTMLElement>()
  const isChartReady = ref(false)

  // Fonction de tri et limitation des données
  function processChartData<T extends ChartDataItem>(data: T[]): T[] {
    let processedData = [...data]

    // Tri si spécifié
    if (sortBy) {
      processedData.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        const aStr = String(aValue)
        const bStr = String(bValue)
        return sortOrder === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr)
      })
    }

    // Limitation du nombre d'éléments
    return processedData.slice(0, maxItems)
  }

  // Génération des couleurs pour les données
  function generateColors(dataLength: number): string[] {
    const result: string[] = []
    for (let i = 0; i < dataLength; i++) {
      result.push(colors[i % colors.length])
    }
    return result
  }

  // Configuration optimisée pour les graphiques donut
  function createDonutConfig(data: T[], valueKey: keyof T, labelKey: keyof T) {
    const processedData = processChartData(data)
    const chartColors = generateColors(processedData.length)
    
    const total = processedData.reduce((sum, item) => {
      const value = item[valueKey]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)

    return {
      data: processedData.map((item, index) => ({
        ...item,
        color: chartColors[index],
        percentage: total > 0 ? Math.round((Number(item[valueKey]) / total) * 100) : 0
      })),
      colors: chartColors,
      total,
      config: {
        innerRadius: 60,
        outerRadius: 100,
        padAngle: 0.02,
        cornerRadius: 3
      }
    }
  }

  // Configuration pour les graphiques en barres
  function createBarConfig(data: T[], valueKey: keyof T, labelKey: keyof T) {
    const processedData = processChartData(data)
    const chartColors = generateColors(processedData.length)

    return {
      data: processedData.map((item, index) => ({
        ...item,
        color: chartColors[index]
      })),
      colors: chartColors,
      config: {
        margin: { top: 20, right: 30, bottom: 40, left: 40 },
        barRadius: 4
      }
    }
  }

  // Initialisation du graphique avec gestion d'erreurs
  async function initializeChart(callback?: () => void) {
    try {
      await nextTick()
      
      if (!chartContainer.value) {
        console.warn('Chart container not found')
        return
      }

      isChartReady.value = true
      callback?.()
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du graphique:', error)
    }
  }

  // Mise à jour des couleurs (remplace forceBarColors)
  function updateChartColors(customColors?: string[]) {
    if (!chartContainer.value || !isChartReady.value) return

    try {
      const colorsToUse = customColors || colors
      const elements = chartContainer.value.querySelectorAll('[data-chart-item]')
      
      elements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        const color = colorsToUse[index % colorsToUse.length]
        
        // Méthode plus robuste que la manipulation directe
        htmlElement.style.setProperty('--chart-color', color)
        htmlElement.setAttribute('data-color', color)
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour des couleurs:', error)
    }
  }

  // Calcul des métriques pour les tooltips
  const chartMetrics = computed(() => ({
    isReady: isChartReady.value,
    hasContainer: !!chartContainer.value,
    colorsCount: colors.length
  }))

  onMounted(() => {
    initializeChart()
  })

  return {
    // Refs
    chartContainer,
    isChartReady: readonly(isChartReady),
    
    // Fonctions utilitaires
    processChartData,
    generateColors,
    createDonutConfig,
    createBarConfig,
    initializeChart,
    updateChartColors,
    
    // État
    chartMetrics: readonly(chartMetrics),
    
    // Constantes
    CHART_COLORS,
  }
}