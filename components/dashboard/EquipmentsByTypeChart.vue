<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/ui/chart-bar'
import { useChart } from '@/composables/useChart'

interface EquipmentTypeItem {
  type: string
  count: number
}

interface Props {
  data: EquipmentTypeItem[]
  title?: string
  description?: string
  height?: string
  showTooltip?: boolean
  showLegend?: boolean
  showGridLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Équipements sportifs par type',
  description: 'Répartition des différents types d\'équipements',
  height: 'h-80',
  showTooltip: true,
  showLegend: false,
  showGridLine: true,
})

// Utilisation du composable optimisé
const { chartContainer, createBarConfig, isChartReady } = useChart<EquipmentTypeItem>({
  maxItems: 15,
  sortBy: 'count',
  sortOrder: 'desc'
})

// Configuration du graphique avec les nouvelles données
const chartConfig = computed(() => createBarConfig(props.data, 'count', 'type'))

// Données formatées pour le graphique
const chartData = computed(() => 
  chartConfig.value.data.map(item => ({
    type: item.type,
    count: item.count,
    fill: item.color
  }))
)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription v-if="description">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div ref="chartContainer" :class="height">
        <BarChart
          v-if="isChartReady && chartData.length > 0"
          :data="chartData"
          index="type"
          :categories="['count']"
          :colors="chartConfig.colors"
          :show-tooltip="showTooltip"
          :show-legend="showLegend"
          :show-grid-line="showGridLine"
          class="h-full w-full"
        />
        <div v-else-if="!chartData.length" class="flex items-center justify-center h-full text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    </CardContent>
  </Card>
</template>