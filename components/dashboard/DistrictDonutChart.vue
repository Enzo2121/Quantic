<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DistrictItem {
  district: string
  displayName: string
  total: number
}

interface Props {
  title: string
  description?: string
  data: DistrictItem[]
  colors?: string[]
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  colors: () => ['#5f259f', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#84cc16'],
  maxItems: 10,
})

// État pour le hover et position de la souris
const hoveredSegment = ref<number | null>(null)
const mousePosition = ref({ x: 0, y: 0 })

// Transform data for donut
const donutData = computed(() => {
  if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
    return []
  }

  const filteredData = props.data
    .filter(item => item && typeof item === 'object' && item.total > 0)
    .slice(0, props.maxItems)

  const total = filteredData.reduce((sum, item) => sum + item.total, 0)
  if (total === 0) return []

  let cumulativePercentage = 0
  
  return filteredData.map((item, index) => {
    const percentage = (item.total / total) * 100
    const startAngle = (cumulativePercentage * 3.6) - 90
    const endAngle = ((cumulativePercentage + percentage) * 3.6) - 90
    
    cumulativePercentage += percentage
    
    return {
      district: item.displayName,
      count: item.total,
      percentage: Math.round(percentage),
      startAngle,
      endAngle,
      color: props.colors[index % props.colors.length],
    }
  })
})

const hasData = computed(() => donutData.value.length > 0)
const total = computed(() => donutData.value.reduce((sum, item) => sum + item.count, 0))

// Fonction pour créer le path SVG pour chaque segment
function createArcPath(startAngle: number, endAngle: number, innerRadius = 60, outerRadius = 90) {
  const start = polarToCartesian(100, 100, outerRadius, endAngle)
  const end = polarToCartesian(100, 100, outerRadius, startAngle)
  const innerStart = polarToCartesian(100, 100, innerRadius, endAngle)
  const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle)
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  
  return [
    "M", start.x, start.y, 
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z"
  ].join(" ")
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = angleInDegrees * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

// Gestion du hover et position de la souris
function handleMouseEnter(index: number, event?: MouseEvent) {
  hoveredSegment.value = index
  if (event) {
    updateMousePosition(event)
  }
}

function handleMouseMove(event: MouseEvent) {
  updateMousePosition(event)
}

function handleMouseLeave() {
  hoveredSegment.value = null
}

function updateMousePosition(event: MouseEvent) {
  const rect = event.currentTarget?.getBoundingClientRect()
  if (rect) {
    mousePosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="text-base">
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="hasData" class="flex flex-col gap-4">
        <!-- Donut Chart SVG avec Tooltip -->
        <div class="relative flex h-48 w-full items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <g>
              <path
                v-for="(segment, index) in donutData"
                :key="segment.district"
                :d="createArcPath(segment.startAngle, segment.endAngle)"
                :fill="segment.color"
                class="cursor-pointer transition-all duration-200"
                :class="{
                  'opacity-60': hoveredSegment === index,
                  'opacity-80': hoveredSegment !== null && hoveredSegment !== index
                }"
                :style="{
                  transformOrigin: '100px 100px',
                  transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)'
                }"
                @mouseenter="handleMouseEnter(index, $event)"
                @mousemove="handleMouseMove($event)"
                @mouseleave="handleMouseLeave"
              />
            </g>
          </svg>
          
          <!-- Texte central -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div class="text-2xl font-bold">{{ total }}</div>
            <div class="text-sm text-muted-foreground">Total</div>
          </div>

          <!-- Tooltip sur hover -->
          <div 
            v-if="hoveredSegment !== null"
            class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-sm shadow-lg z-10 pointer-events-none"
            :style="{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }"
          >
            <div class="font-semibold">{{ donutData[hoveredSegment].district }}</div>
            <div class="text-xs">
              {{ donutData[hoveredSegment].count }} équipements ({{ donutData[hoveredSegment].percentage }}%)
            </div>
          </div>
        </div>

        <!-- Légende horizontale -->
        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <div
            v-for="(item, index) in donutData"
            :key="item.district"
            class="flex items-center gap-2 text-sm cursor-pointer transition-all duration-200"
            :class="{
              'opacity-60': hoveredSegment !== null && hoveredSegment !== index,
              'font-medium': hoveredSegment === index
            }"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave"
          >
            <div
              class="h-3 w-3 rounded-full transition-all duration-200 flex-shrink-0"
              :style="{ backgroundColor: item.color }"
              :class="{
                'scale-125': hoveredSegment === index
              }"
            />
            <span class="font-medium whitespace-nowrap">{{ item.district }}</span>
          </div>
        </div>
      </div>
      
      <!-- État sans données -->
      <div v-else class="flex h-48 items-center justify-center">
        <div class="text-center">
          <Icon name="i-lucide-pie-chart" class="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            Aucune donnée disponible
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>