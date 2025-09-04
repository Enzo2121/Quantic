<script setup lang="ts" generic="T extends Record<string, any>">
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import { useMounted } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { cn } from '@/lib/utils'
import type { BaseChartProps } from '.'
import { ChartSingleTooltip, defaultColors } from '../chart'

const props = withDefaults(defineProps<Pick<BaseChartProps<T>, 'data' | 'colors' | 'index' | 'margin' | 'showLegend' | 'showTooltip' | 'filterOpacity'> & {
  /**
   * Sets the name of the key containing the quantitative chart values.
   */
  category: KeyOfT
  /**
   * Change the type of the chart
   * @default "donut"
   */
  type?: 'donut' | 'pie'
  /**
   * Function to sort the segment
   */
  sortFunction?: (a: any, b: any) => number | undefined
  /**
   * Controls the formatting for the label.
   */
  valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string
  /**
   * Render custom tooltip component.
   */
  customTooltip?: Component
  /**
   * Additional totals to display in tooltip (for equipment breakdown)
   */
  totals?: {
    equipements?: number
    espacesVerts?: number
    fontaines?: number
  }
}>(), {
  margin: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  sortFunction: () => undefined,
  valueFormatter: (tick: number) => `${tick}`,
  type: 'donut',
  filterOpacity: 0.2,
  showTooltip: true,
  showLegend: true,
  totals: () => ({}),
})

type KeyOfT = Extract<keyof T, string>
type Data = typeof props.data[number]

const category = computed(() => props.category as KeyOfT)
const index = computed(() => props.index as KeyOfT)

const isMounted = useMounted()
const activeSegmentKey = ref<string>()
const colors = computed(() => props.colors?.length ? props.colors : defaultColors(props.data.filter(d => d[props.category]).filter(Boolean).length))

const totalValue = computed(() => props.data.reduce((prev, curr) => {
  return prev + curr[props.category]
}, 0))

const legendItems = computed(() => {
  const items: Array<{
    name: string
    color: string
    inactive: boolean
    value?: number
  }> = [...props.data.map((item, i) => ({
    name: item[props.index],
    color: colors.value[i],
    inactive: false,
  }))]

  // Ajouter les détails des équipements si disponibles
  if (props.totals?.equipements !== undefined) {
    items.push({
      name: 'Équipements sportifs',
      color: '#5f259f',
      inactive: false,
      value: props.totals.equipements,
    })
  }

  if (props.totals?.espacesVerts !== undefined) {
    items.push({
      name: 'Espaces verts',
      color: '#22c55e',
      inactive: false,
      value: props.totals.espacesVerts,
    })
  }

  if (props.totals?.fontaines !== undefined) {
    items.push({
      name: 'Fontaines',
      color: '#3b82f6',
      inactive: false,
      value: props.totals.fontaines,
    })
  }

  // Ajouter le total général
  items.push({
    name: 'Total général',
    color: '#666666',
    inactive: false,
    value: totalValue.value,
  })

  return items
})
</script>

<template>
  <div :class="cn('w-full h-96 flex flex-col items-end', $attrs.class ?? '')">
    <VisSingleContainer :style="{ height: isMounted ? '100%' : 'auto' }" :margin="{ left: 60, right: 60 }" :data="data">
      <ChartSingleTooltip
        :selector="Donut.selectors.segment"
        :index="index"
        :items="legendItems"
        :value-formatter="valueFormatter"
        :custom-tooltip="customTooltip"
      />

      <VisDonut
        :value="(d: Data) => d[category]"
        :sort-function="sortFunction"
        :color="colors"
        :radius="160"
        :arc-width="type === 'donut' ? 80 : 0"
        :show-background="false"
        :central-label="type === 'donut' ? valueFormatter(totalValue) : ''"
        :events="{
          [Donut.selectors.segment]: {
            click: (d: Data, ev: PointerEvent, i: number, elements: HTMLElement[]) => {
              if (d?.data?.[index] === activeSegmentKey) {
                activeSegmentKey = undefined
                elements.forEach(el => el.style.opacity = '1')
              }
              else {
                activeSegmentKey = d?.data?.[index]
                elements.forEach(el => el.style.opacity = `${filterOpacity}`)
                elements[i].style.opacity = '1'
              }
            },
          },
        }"
      />

      <slot />
    </VisSingleContainer>
  </div>
</template>
