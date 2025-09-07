import { nextTick, onMounted, ref, computed, readonly } from 'vue'

export const CHART_COLORS = [
  '#5f259f', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#84cc16'
] as const

export interface ChartDataItem {
  [key: string]: any
}

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

  function processChartData<T extends ChartDataItem>(data: T[]): T[] {
    let processedData = [...data]

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

    return processedData.slice(0, maxItems)
  }

  function generateColors(dataLength: number): string[] {
    const result: string[] = []
    for (let i = 0; i < dataLength; i++) {
      result.push(colors[i % colors.length])
    }
    return result
  }

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

  async function initializeChart(callback?: () => void) {
    try {
      await nextTick()
      
      if (!chartContainer.value) {
        return
      }

      isChartReady.value = true
      callback?.()
    } catch (error) {
      // Silently handle errors
    }
  }

  function updateChartColors(customColors?: string[]) {
    if (!chartContainer.value || !isChartReady.value) return

    try {
      const colorsToUse = customColors || colors
      const elements = chartContainer.value.querySelectorAll('[data-chart-item]')
      
      elements.forEach((element, index) => {
        const htmlElement = element as HTMLElement
        const color = colorsToUse[index % colorsToUse.length]
        
        htmlElement.style.setProperty('--chart-color', color)
        htmlElement.setAttribute('data-color', color)
      })
    } catch (error) {
      // Silently handle errors
    }
  }

  const chartMetrics = computed(() => ({
    isReady: isChartReady.value,
    hasContainer: !!chartContainer.value,
    colorsCount: colors.length
  }))

  onMounted(() => {
    initializeChart()
  })

  return {
    chartContainer,
    isChartReady: readonly(isChartReady),
    
    processChartData,
    generateColors,
    createDonutConfig,
    createBarConfig,
    initializeChart,
    updateChartColors,
    
    chartMetrics: readonly(chartMetrics),
    
    CHART_COLORS,
  }
}