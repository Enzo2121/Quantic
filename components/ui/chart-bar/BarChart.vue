<script setup lang="ts" generic="T extends Record<string, any>">
import type { BulletLegendItemInterface } from '@unovis/ts'
import type { Component } from 'vue'
import type { BaseChartProps } from '.'
import { VisAxis, VisBulletLegend, VisGroupedBar, VisStackedBar, VisXYContainer } from '@unovis/vue'
import { useMounted } from '@vueuse/core'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { ChartCrosshair, defaultColors } from '../chart'

const props = withDefaults(defineProps<BaseChartProps<T> & {

  customTooltip?: Component
  /**
   * Change the type of the chart
   * @default "grouped"
   */
  type?: 'stacked' | 'grouped'
  /**
   * Orientation of the bars
   * @default "vertical"
   */
  orientation?: 'vertical' | 'horizontal'
  /**
   * Rounded bar corne
   * @default 0
   */
  roundedCorners?: number
}>(), {
  type: 'grouped',
  orientation: 'vertical',
  margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  filterOpacity: 0.2,
  roundedCorners: 0,
  showXAxis: true,
  showYAxis: true,
  showTooltip: true,
  showLegend: true,
  showGridLine: true,
})
const emits = defineEmits<{
  legendItemClick: [d: BulletLegendItemInterface, i: number]
}>()

type KeyOfT = Extract<keyof T, string>
type Data = typeof props.data[number]

const index = computed(() => props.index as KeyOfT)
const colors = computed(() => props.colors?.length ? props.colors : defaultColors(props.categories.length))

const legendItems = computed(() =>
  props.categories.map((category, i) => ({
    name: category,
    color: colors.value[i],
    inactive: false,
  })),
)

const _isMounted = useMounted()

const x = computed(() => {
  if (props.orientation === 'horizontal') {
    return props.categories.map(category => (d: Data) => d[category])
  }
  return (d: Data, i: number) => i
})

const y = computed(() => {
  if (props.orientation === 'horizontal') {
    return (d: Data, i: number) => i
  }
  return props.categories.map(category => (d: Data) => d[category])
})

const color = (d: Data, i: number) => colors.value[i % colors.value.length]

function handleLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits('legendItemClick', d, i)
}

const VisBarComponent = computed(() => props.type === 'grouped' ? VisGroupedBar : VisStackedBar)
</script>

<template>
  <div :class="cn('w-full h-[400px] flex flex-col items-end', $attrs.class ?? '')">
    <VisBulletLegend v-if="showLegend" :items="legendItems" @legend-item-click="handleLegendItemClick" />

    <VisXYContainer
      :data="data"
      :height="400"
      :margin="margin"
    >
      <ChartCrosshair v-if="showTooltip" :colors="colors" :items="legendItems" :custom-tooltip="customTooltip" :index="index" />

      <VisBarComponent
        :x="x"
        :y="y"
        :color="color"
        :rounded-corners="roundedCorners"
        :bar-padding="0.05"
      />

      <VisAxis
        v-if="showXAxis"
        type="x"
        :tick-format="orientation === 'horizontal' ? yFormatter : (xFormatter ?? ((v: number) => data[v]?.[index]))"
        :grid-line="orientation === 'horizontal' && showGridLine"
        :tick-line="false"
        tick-text-color="hsl(var(--muted-foreground))"
      />
      <VisAxis
        v-if="showYAxis"
        type="y"
        :tick-line="false"
        :tick-format="orientation === 'horizontal' ? (xFormatter ?? ((v: number) => data[v]?.[index])) : yFormatter"
        :domain-line="false"
        :grid-line="orientation === 'vertical' && showGridLine"
        tick-text-color="hsl(var(--muted-foreground))"
      />

      <slot />
    </VisXYContainer>
  </div>
</template>
