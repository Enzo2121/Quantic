<script setup lang="ts">
import { VisXYContainer, VisStackedBar, VisTooltip, VisCrosshair } from '@unovis/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ComparisonTooltip from '@/components/ui/chart/ComparisonTooltip.vue'
import { createApp } from 'vue'

interface ComparisonData {
  district: string
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
  maxItems: 10
})

// Préparer les données pour le graphique empilé
const chartData = computed(() => {
  return props.data
    .slice(0, props.maxItems)
    .map(item => ({
      x: item.district,
      y: item.equipements,
      y1: item.espaces,
      y2: item.fontaines
    }))
})

// Configuration des axes et couleurs
const x = (d: any) => d.x
const y = [
  (d: any) => d.y,   // Équipements sportifs
  (d: any) => d.y1,  // Espaces verts
  (d: any) => d.y2   // Fontaines
]

// Couleurs pour chaque catégorie
const colors = ['#5f259f', '#22c55e', '#3b82f6']
const categories = ['Équipements sportifs', 'Espaces verts', 'Fontaines']

// Configuration du tooltip personnalisé
const wm = new WeakMap()

function tooltipTemplate(d: any) {
  if (wm.has(d)) {
    return wm.get(d)
  }

  // Trouver les données originales correspondant à cet élément du graphique
  const originalData = props.data.find(item => item.district === d.x)

  if (!originalData) {
    return '<div>Données non disponibles</div>'
  }

  const componentDiv = document.createElement('div')
  const tooltipData = {
    district: originalData.district,
    displayName: originalData.displayName || originalData.district,
    equipements: originalData.equipements,
    espaces: originalData.espaces,
    fontaines: originalData.fontaines,
    total: originalData.total
  }

  createApp(ComparisonTooltip, {
    title: tooltipData.displayName,
    comparisonData: tooltipData
  }).mount(componentDiv)

  wm.set(d, componentDiv.innerHTML)
  return componentDiv.innerHTML
}

function tooltipColor(d: unknown, i: number) {
  return colors[i] ?? 'transparent'
}
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
    <CardContent>
      <div class="h-80 w-full">
        <VisXYContainer
          :data="chartData"
          :tooltip="{ container: $el?.parentElement, portal: false }"
          :crosshair="{ container: $el?.parentElement }"
        >
          <VisTooltip
            :horizontal-shift="20"
            :vertical-shift="20"
            :style="{ backdropFilter: 'none', filter: 'none', WebkitBackdropFilter: 'none', WebkitFilter: 'none' }"
          />
          <VisCrosshair
            :template="tooltipTemplate"
            :color="tooltipColor"
          />

          <VisStackedBar
            :x="x"
            :y="y"
            :color="colors"
            :duration="800"
            :bar-padding="0.2"
            :bar-group-padding="0.1"
            :rounded-corners="4"
          />
        </VisXYContainer>
      </div>

      <!-- Légende -->
      <div class="flex justify-center gap-6 mt-4">
        <div
          v-for="(category, index) in categories"
          :key="category"
          class="flex items-center gap-2"
        >
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: colors[index] }"
          />
          <span class="text-sm text-muted-foreground">{{ category }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
