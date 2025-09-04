<script setup lang="ts">
interface FilterStatus {
  hasActiveFilters: boolean
  activeFiltersCount: number
  isLimitedByData: boolean
  loadedItems: number
  totalAvailable: number
  loadingMode: 'initial' | 'medium' | 'full'
}

interface SmartLoadSuggestion {
  type: 'medium' | 'full'
  reason: string
  expectedItems: number
}

interface Props {
  filterStatus: FilterStatus
  smartLoadSuggestion: SmartLoadSuggestion | null
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  loadSuggested: [mode: 'medium' | 'full']
}>()

const showFilterWarning = computed(() => {
  return props.filterStatus.hasActiveFilters &&
         props.filterStatus.isLimitedByData &&
         props.filterStatus.loadingMode !== 'full'
})

const loadedPercentage = computed(() => {
  if (props.filterStatus.totalAvailable === 0) return 0
  return Math.round((props.filterStatus.loadedItems / props.filterStatus.totalAvailable) * 100)
})

const shouldShowSuggestion = computed(() => {
  return props.smartLoadSuggestion && !props.loading
})

function handleLoadSuggestion() {
  if (props.smartLoadSuggestion) {
    emit('loadSuggested', props.smartLoadSuggestion.type)
  }
}
</script>

<template>
  <div v-if="showFilterWarning || shouldShowSuggestion" class="space-y-3">
    <Alert v-if="showFilterWarning" variant="default" class="border-amber-200 bg-amber-50">
      <AlertTriangleIcon class="h-4 w-4" />
      <AlertDescription class="flex items-center justify-between">
        <div>
          <strong>{{ filterStatus.activeFiltersCount }} filtre{{ filterStatus.activeFiltersCount > 1 ? 's' : '' }} actif{{ filterStatus.activeFiltersCount > 1 ? 's' : '' }}</strong>
          - Affichage de {{ filterStatus.loadedItems }} sur {{ filterStatus.totalAvailable }} éléments disponibles
          <span class="text-amber-700">({{ loadedPercentage }}% chargé)</span>
        </div>
      </AlertDescription>
    </Alert>

    <Alert v-if="shouldShowSuggestion" variant="default" class="border-blue-200 bg-blue-50">
      <InfoIcon class="h-4 w-4" />
      <AlertDescription class="flex items-center justify-between">
        <div class="flex-1">
          <strong>Suggestion :</strong> {{ smartLoadSuggestion?.reason }}
          <br>
          <small class="text-blue-700">
            Cela chargera environ {{ smartLoadSuggestion?.expectedItems }} éléments pour de meilleurs résultats
          </small>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="ml-4"
          @click="handleLoadSuggestion"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Charger {{ smartLoadSuggestion?.type === 'medium' ? 'plus' : 'tout' }}
        </Button>
      </AlertDescription>
    </Alert>
  </div>
</template>
