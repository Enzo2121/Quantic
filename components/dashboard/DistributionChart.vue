<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutChart } from '@/components/ui/chart-donut'

interface DistributionItem {
  name: string
  value: number
  color: string
}

interface Props {
  data: DistributionItem[]
  title?: string
  description?: string
  height?: string
  colors?: string[]
  showTooltip?: boolean
  showLegend?: boolean
  totals?: {
    equipements?: number
    espacesVerts?: number
    fontaines?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Répartition générale',
  description: 'Distribution des équipements par catégorie',
  height: 'h-96',
  colors: () => ['#5f259f', '#22c55e', '#3b82f6'],
  showTooltip: true,
  showLegend: true,
  totals: () => ({}),
})

const chartColors = computed(() =>
  props.colors.length > 0 ? props.colors : ['#5f259f', '#22c55e', '#3b82f6'],
)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div :class="height" class="flex items-center justify-center">
        <div class="flex items-center justify-center w-full h-full">
          <DonutChart
            :data="data"
            index="name"
            category="value"
            :colors="chartColors"
            :show-tooltip="showTooltip"
            :show-legend="showLegend"
            :totals="totals"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
