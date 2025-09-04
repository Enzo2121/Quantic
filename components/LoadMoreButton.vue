<script setup lang="ts">
interface SmartLoadSuggestion {
  type: 'medium' | 'full'
  reason: string
  expectedItems: number
}

interface Props {
  loading: boolean
  loadingMode: 'initial' | 'medium' | 'full'
  hasLoadedMore: boolean
  canLoadMore: boolean
  totalItems: number
  currentItems: number
  smartLoadSuggestion?: SmartLoadSuggestion | null
  hasActiveFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMode: 'initial',
  hasLoadedMore: false,
  canLoadMore: true,
  totalItems: 0,
  currentItems: 0,
  smartLoadSuggestion: null,
  hasActiveFilters: false
})

const emit = defineEmits<{
  loadMore: [mode: 'medium' | 'full']
}>()

const buttonText = computed(() => {
  if (props.loading) return 'Chargement...'

  if (props.smartLoadSuggestion) {
    return `Charger ${props.smartLoadSuggestion.type === 'medium' ? 'plus' : 'tout'} (${props.smartLoadSuggestion.expectedItems} éléments)`
  }

  if (props.loadingMode === 'initial') {
    const remaining = props.totalItems - props.currentItems
    return `Charger plus de données (${remaining} restantes)`
  }

  if (props.loadingMode === 'medium') {
    return 'Charger toutes les données'
  }

  return 'Toutes les données chargées'
})

const buttonIcon = computed(() => {
  if (props.loading) return 'i-lucide-loader-2'
  if (props.loadingMode === 'initial') return 'i-lucide-plus'
  if (props.loadingMode === 'medium') return 'i-lucide-database'
  return 'i-lucide-check'
})

const buttonVariant = computed(() => {
  if (props.loading) return 'secondary'
  if (props.loadingMode === 'initial') return 'outline'
  if (props.loadingMode === 'medium') return 'default'
  return 'secondary'
})

function handleClick() {
  if (props.loading || !props.canLoadMore) return

  const mode = props.smartLoadSuggestion?.type ||
               (props.loadingMode === 'initial' ? 'medium' : 'full')

  emit('loadMore', mode)
}
</script>

<template>
  <div v-if="canLoadMore || loadingMode === 'full'" class="flex flex-col items-center gap-3 py-6">
    <div class="text-sm text-muted-foreground text-center">
      <p>
        Affichage de <strong>{{ currentItems }}</strong> éléments sur <strong>{{ totalItems }}</strong> disponibles
        <span v-if="hasActiveFilters" class="text-amber-600">• Filtres actifs</span>
      </p>
      <p v-if="smartLoadSuggestion" class="text-blue-600 mt-1">
        💡 {{ smartLoadSuggestion.reason }}
      </p>
      <p v-if="loadingMode === 'full'" class="text-green-600 font-medium">
        ✓ Toutes les données sont chargées
      </p>
    </div>

    <Button
      :variant="buttonVariant"
      :disabled="loading || !canLoadMore"
      :class="{
        'animate-pulse': loading,
        'cursor-not-allowed': !canLoadMore
      }"
      @click="handleClick"
    >
      <Icon :name="buttonIcon" :class="{ 'animate-spin': loading }" class="h-4 w-4 mr-2" />
      {{ buttonText }}
    </Button>

    <div v-if="totalItems > 0" class="w-full max-w-xs">
      <Progress
        :value="(currentItems / totalItems) * 100"
        class="h-2"
      />
      <p class="text-xs text-muted-foreground text-center mt-1">
        {{ Math.round((currentItems / totalItems) * 100) }}% chargé
      </p>
    </div>
  </div>
</template>
