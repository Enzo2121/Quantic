<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HoraireItem {
  type: string
  count: number
  percentage: number
}

interface Props {
  title: string
  description?: string
  data: HoraireItem[]
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  colors: () => ['#22c55e', '#3b82f6', '#f59e0b', '#6b7280', '#ef4444'],
})

const hoveredSegment = ref<number | null>(null)
const mousePosition = ref({ x: 0, y: 0 })

const donutData = computed(() => {
  if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
    return []
  }

  const total = props.data.reduce((sum, item) => sum + item.count, 0)
  if (total === 0) return []

  let cumulativePercentage = 0
  
  return props.data
    .filter(item => item && typeof item === 'object' && item.count > 0)
    .map((item, index) => {
      const percentage = (item.count / total) * 100
      const startAngle = (cumulativePercentage * 3.6) - 90
      const endAngle = ((cumulativePercentage + percentage) * 3.6) - 90
      
      cumulativePercentage += percentage
      
      return {
        ...item,
        percentage: Math.round(percentage),
        startAngle,
        endAngle,
        color: props.colors[index % props.colors.length],
      }
    })
})

const hasData = computed(() => donutData.value.length > 0)
const total = computed(() => donutData.value.reduce((sum, item) => sum + item.count, 0))

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
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
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
        <div class="relative flex h-48 w-full items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <g>
              <path
                v-for="(segment, index) in donutData"
                :key="segment.type"
                :d="createArcPath(segment.startAngle, segment.endAngle)"
                :fill="segment.color"
                :stroke="hoveredSegment === index ? '#ffffff' : 'transparent'"
                :stroke-width="hoveredSegment === index ? '2' : '0'"
                class="cursor-pointer transition-all duration-200"
                :class="{
                  'opacity-80': hoveredSegment !== null && hoveredSegment !== index,
                  'scale-105': hoveredSegment === index
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
          
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div class="text-2xl font-bold">{{ total }}</div>
            <div class="text-sm text-muted-foreground">Total</div>
          </div>

          <!-- Tooltip sur hover avec Teleport -->
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
              <div class="font-semibold">{{ donutData[hoveredSegment].type }}</div>
              <div class="text-muted-foreground">
                {{ donutData[hoveredSegment].count }} éléments ({{ donutData[hoveredSegment].percentage }}%)
              </div>
            </div>
          </Teleport>
        </div>

        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <div
            v-for="(item, index) in donutData"
            :key="item.type"
            class="flex items-center gap-2 text-xs cursor-pointer transition-all duration-200"
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
            <span class="font-medium whitespace-nowrap text-xs">{{ item.type }}</span>
          </div>
        </div>
      </div>
      
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