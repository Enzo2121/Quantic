<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/ui/chart-bar'

interface ComparisonData {
  district: string
  displayName?: string
  equipements: number
  espaces: number
  fontaines: number
  total: number
}

interface Props {
  data: ComparisonData[]
  title?: string
  description?: string
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Comparaison par arrondissement',
  description: 'Équipements urbains par quartier',
  maxItems: 10,
})

const chartData = computed(() => {
  return props.data
    .slice(0, props.maxItems)
    .map(item => ({
      district: item.displayName || item.district,
      equipements: item.equipements,
      espaces: item.espaces,
      fontaines: item.fontaines,
    }))
})

const categories = ['equipements', 'espaces', 'fontaines']
const colors = ['#5f259f', '#22c55e', '#3b82f6']
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Icon name="i-lucide-bar-chart-3" class="h-5 w-5 text-violet" />
        {{ title }}
      </CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="p-4">
      <div class="h-80 w-full overflow-hidden relative">
        <div class="absolute inset-0">
          <BarChart
            :data="chartData"
            :categories="categories"
            index="district"
            :colors="colors"
            type="stacked"
            :show-tooltip="true"
            :show-legend="true"
            :show-grid-line="true"
            :show-x-axis="true"
            :show-y-axis="true"
            :rounded-corners="4"
            :margin="{ top: 20, bottom: 80, left: 80, right: 40 }"
            class="!h-full !w-full !max-w-full !max-h-full"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
