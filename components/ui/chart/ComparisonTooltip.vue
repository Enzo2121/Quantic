<script setup lang="ts">
interface TooltipData {
  name: string
  color: string
  value: number
}

interface ComparisonTooltipData {
  district: string
  displayName: string
  equipements: number
  espaces: number
  fontaines: number
  total: number
}

interface Props {
  title?: string
  data: TooltipData[]
  comparisonData?: ComparisonTooltipData
}

const props = defineProps<Props>()

// Si on a des données de comparaison détaillées, les utiliser
const displayData = computed(() => {
  if (props.comparisonData) {
    return [
      {
        name: 'Équipements sportifs',
        value: props.comparisonData.equipements,
        color: '#5f259f',
      },
      {
        name: 'Espaces verts',
        value: props.comparisonData.espaces,
        color: '#22c55e',
      },
      {
        name: 'Fontaines',
        value: props.comparisonData.fontaines,
        color: '#3b82f6',
      },
    ]
  }
  return props.data
})
</script>

<template>
  <div class="min-w-[180px] max-w-[240px] rounded-md p-3 bg-popover border shadow-sm text-popover-foreground" style="backdrop-filter: none; -webkit-backdrop-filter: none; filter: none; -webkit-filter: none; position: relative !important; contain: none !important; transform: none !important;">
    <!-- Header minimal -->
    <div v-if="comparisonData" class="mb-2 pb-2 border-b">
      <div class="text-sm font-semibold">
        {{ comparisonData.displayName }}
      </div>
      <div class="text-xs opacity-70">
        Arr. {{ comparisonData.district }}
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-1">
      <div
        v-for="(item, key) in displayData"
        :key="key"
        class="flex justify-between items-center text-sm"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          <span class="text-xs opacity-70">{{ item.name }}</span>
        </div>
        <span class="font-medium tabular-nums">{{ item.value }}</span>
      </div>

      <!-- Separator and total -->
      <div v-if="comparisonData" class="mt-2 pt-2 border-t">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium opacity-70">Total</span>
          <span class="text-sm font-semibold tabular-nums">{{ comparisonData.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
