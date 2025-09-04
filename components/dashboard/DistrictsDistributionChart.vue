<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/ui/chart-bar'
import { nextTick, onMounted } from 'vue'

interface DistrictItem {
  district: string
  total: number
  equipements: number
  espaces: number
  fontaines: number
}

interface Props {
  data: DistrictItem[]
  title?: string
  description?: string
  height?: string
  showTooltip?: boolean
  showLegend?: boolean
  showGridLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Distribution par arrondissement',
  description: 'Nombre d\'équipements par quartier',
  height: 'h-80',
  showTooltip: true,
  showLegend: false,
  showGridLine: true,
})

onMounted(async () => {
  await nextTick()
  forceBarColors()
})

const forceBarColors = () => {
  const container = document.querySelector('.chart-container')
  if (container) {
    const bars = container.querySelectorAll('rect')
    bars.forEach((bar) => {
      bar.setAttribute('fill', '#5f259f')
    })

    const observer = new MutationObserver(() => {
      const newBars = container.querySelectorAll('rect')
      newBars.forEach((bar) => {
        if (bar.getAttribute('fill') !== '#5f259f') {
          bar.setAttribute('fill', '#5f259f')
        }
      })
    })

    observer.observe(container, { childList: true, subtree: true })
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div :class="height" class="chart-container">
        <BarChart
          :data="data"
          :categories="['total']"
          index="district"
          :colors="['#5f259f']"
          :show-tooltip="showTooltip"
          :show-legend="showLegend"
          :show-grid-line="showGridLine"
          :show-x-axis="true"
          :show-y-axis="true"
          :rounded-corners="2"
        />
      </div>
    </CardContent>
  </Card>
</template>