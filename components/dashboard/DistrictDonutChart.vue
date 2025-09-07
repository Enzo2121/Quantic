<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useChart } from '@/composables/useChart'

interface DistrictItem {
  district: string
  displayName: string
  total: number
}

interface Props {
  title: string
  description?: string
  data: DistrictItem[]
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  maxItems: 10,
})

// Utilisation du composable optimisé
const { createDonutConfig, isChartReady, CHART_COLORS } = useChart<DistrictItem>({
  maxItems: props.maxItems,
  sortBy: 'total',
  sortOrder: 'desc'
})

// État pour le hover optimisé
const hoveredSegment = ref<number | null>(null)
const mousePosition = ref({ x: 0, y: 0 })

// Configuration du graphique donut
const donutConfig = computed(() => createDonutConfig(props.data, 'total', 'displayName'))

// Vérification que nous avons des données valides
const hasValidData = computed(() => {
  return props.data && props.data.length > 0 && props.data.some(item => item.total > 0)
})

// Données transformées pour le rendu SVG
const donutData = computed(() => {
  const { data, total, config } = donutConfig.value
  
  if (!data.length || total === 0) return []
  
  let cumulativeAngle = 0
  
  return data.map((item, index) => {
    const percentage = (item.total / total) * 100
    const angle = (item.total / total) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    
    cumulativeAngle += angle
    
    // Calcul des coordonnées pour l'arc SVG
    const centerX = 120
    const centerY = 120
    const { innerRadius, outerRadius } = config
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad)
    const y1 = centerY + outerRadius * Math.sin(startAngleRad)
    const x2 = centerX + outerRadius * Math.cos(endAngleRad)
    const y2 = centerY + outerRadius * Math.sin(endAngleRad)
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad)
    const y3 = centerY + innerRadius * Math.sin(endAngleRad)
    const x4 = centerX + innerRadius * Math.cos(startAngleRad)
    const y4 = centerY + innerRadius * Math.sin(startAngleRad)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ')
    
    return {
      ...item,
      index,
      pathData,
      percentage: Math.round(percentage),
      startAngle,
      endAngle,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length]
    }
  })
})

// Gestion optimisée des événements de survol
function handleMouseEnter(index: number, event: MouseEvent) {
  hoveredSegment.value = index
  updateMousePosition(event)
}

function handleMouseMove(event: MouseEvent) {
  updateMousePosition(event)
}

function handleMouseLeave() {
  hoveredSegment.value = null
}

function updateMousePosition(event: MouseEvent) {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

// Stats calculées
const totalItems = computed(() => donutConfig.value.total)
const displayedItems = computed(() => donutData.value.length)
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
      <div v-if="hasValidData" class="relative flex items-center justify-center">
        <!-- Graphique SVG optimisé -->
        <svg viewBox="0 0 240 240" class="w-60 h-60">
          <g>
            <path
              v-for="(segment, index) in donutData"
              :key="`segment-${index}`"
              :d="segment.pathData"
              :fill="segment.color"
              :stroke="hoveredSegment === index ? '#ffffff' : 'transparent'"
              :stroke-width="hoveredSegment === index ? '2' : '0'"
              class="transition-all duration-200 cursor-pointer"
              :class="{
                'opacity-80': hoveredSegment !== null && hoveredSegment !== index,
                'scale-105': hoveredSegment === index
              }"
              @mouseenter="handleMouseEnter(index, $event)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            />
          </g>
          
          <!-- Texte central -->
          <text x="120" y="115" text-anchor="middle" class="text-sm font-medium fill-muted-foreground">
            Total
          </text>
          <text x="120" y="135" text-anchor="middle" class="text-xl font-bold fill-foreground">
            {{ totalItems.toLocaleString() }}
          </text>
        </svg>

        <!-- Tooltip optimisé -->
        <Teleport to="body">
          <div
            v-if="hoveredSegment !== null"
            :style="{
              position: 'fixed',
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y - 10}px`,
              zIndex: 9999,
              pointerEvents: 'none'
            }"
            class="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border text-sm"
          >
            <div class="font-medium">{{ donutData[hoveredSegment].displayName }}</div>
            <div class="text-muted-foreground">
              {{ donutData[hoveredSegment].total.toLocaleString() }} éléments ({{ donutData[hoveredSegment].percentage }}%)
            </div>
          </div>
        </Teleport>
      </div>

      <!-- Légende optimisée -->
      <div v-if="donutData.length > 0" class="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div
          v-for="(item, index) in donutData.slice(0, 8)"
          :key="`legend-${index}`"
          class="flex items-center gap-2"
        >
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: item.color }"
          />
          <span class="truncate">{{ item.displayName }}</span>
          <span class="text-muted-foreground ml-auto">{{ item.percentage }}%</span>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="flex items-center justify-center h-60 text-muted-foreground">
        Aucune donnée disponible
      </div>
    </CardContent>
  </Card>
</template>