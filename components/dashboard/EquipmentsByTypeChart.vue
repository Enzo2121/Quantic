<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/ui/chart-bar'
import { nextTick, onMounted } from 'vue'

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

onMounted(async () => {
  await nextTick()
  forceBarColors()
})

const forceBarColors = () => {
  const container = document.querySelector('.chart-container')
  if (container) {
    const bars = container.querySelectorAll('rect')
    bars.forEach((bar) => {
      bar.setAttribute('fill', '#dc2626')
    })

    const observer = new MutationObserver(() => {
      const newBars = container.querySelectorAll('rect')
      newBars.forEach((bar) => {
        if (bar.getAttribute('fill') !== '#dc2626') {
          bar.setAttribute('fill', '#dc2626')
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
          :categories="['count']"
          index="type"
          :colors="['#dc2626']"
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