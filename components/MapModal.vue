<script setup lang="ts">
import type { EquipementSportifItem, EspaceVertItem, FontaineItem } from '~/types/datasets'

interface Props {
  open?: boolean
  items?: (EquipementSportifItem | EspaceVertItem | FontaineItem)[]
  title?: string
  loading?: boolean
  currentStore?: 'equipements' | 'espaces-verts' | 'fontaines'
  filters?: any
  filterOptions?: any
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  items: () => [],
  title: 'Carte interactive',
  loading: false,
  currentStore: 'equipements',
  filters: () => ({}),
  filterOptions: () => ({}),
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:filters': [filters: any]
}>()

const mapView = ref()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const stats = computed(() => {
  const itemsByType = {
    equipements: 0,
    espaces: 0,
    fontaines: 0,
  }

  props.items.forEach((item) => {
    if ('type' in item && typeof item.type === 'string') {
      if (item.type.toLowerCase().includes('sport') || 'payant' in item) {
        itemsByType.equipements++
      } else if (item.type.toLowerCase().includes('fontaine') || 'etat' in item) {
        itemsByType.fontaines++
      } else {
        itemsByType.espaces++
      }
    }
  })

  return {
    total: props.items.length,
    ...itemsByType,
  }
})

function refreshMap() {
  if (mapView.value) {
    mapView.value.invalidateSize()
    setTimeout(() => {
      mapView.value?.forceRefreshMarkers()
    }, 100)
  }
}

function centerOnParis() {
  if (mapView.value) {
    mapView.value.flyToLocation(48.8566, 2.3522)
  }
}

watch(() => props.open, (newOpen) => {
  if (newOpen) {
    nextTick(() => {
      setTimeout(() => {
        refreshMap()
      }, 300)
    })
  }
})

function handleSearchUpdate(value: string) {
  const newFilters = { ...props.filters, search: value }
  emit('update:filters', newFilters)
}

function handleTypesUpdate(value: string[]) {
  const newFilters = { ...props.filters, types: value }
  emit('update:filters', newFilters)
}

function handleCategoriesUpdate(value: string[]) {
  const newFilters = { ...props.filters, categories: value }
  emit('update:filters', newFilters)
}

function handleArrondissementsUpdate(value: string[]) {
  const newFilters = { ...props.filters, arrondissements: value }
  emit('update:filters', newFilters)
}

function handleEtatsUpdate(value: string[]) {
  const newFilters = { ...props.filters, etats: value }
  emit('update:filters', newFilters)
}

function handleFiltersReset() {
  const resetFilters = {
    search: '',
    types: [],
    categories: [],
    arrondissements: [],
    etats: [],
  }
  emit('update:filters', resetFilters)
}

const showCategorieFilter = computed(() => props.currentStore === 'espaces-verts')
const showEtatFilter = computed(() => props.currentStore === 'fontaines')
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0">
      <DialogHeader class="px-6 py-4 border-b bg-background">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <DialogTitle class="text-xl font-bold font-nexa text-quantic">
              {{ title }}
            </DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground">
              {{ stats.total }} élément{{ stats.total > 1 ? 's' : '' }} affiché{{ stats.total > 1 ? 's' : '' }} sur la carte
            </DialogDescription>
          </div>
          
          <div class="flex items-center gap-3">
            <div v-if="stats.equipements > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-dumbbell" class="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" class="text-xs">{{ stats.equipements }}</Badge>
            </div>
            <div v-if="stats.espaces > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-leaf" class="h-4 w-4 text-green-600" />
              <Badge variant="secondary" class="text-xs">{{ stats.espaces }}</Badge>
            </div>
            <div v-if="stats.fontaines > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-droplets" class="h-4 w-4 text-cyan-600" />
              <Badge variant="secondary" class="text-xs">{{ stats.fontaines }}</Badge>
            </div>
          </div>
        </div>
      </DialogHeader>

      <Collapsible class="border-b">
        <CollapsibleTrigger as-child>
          <Button variant="ghost" class="w-full justify-between px-6 py-3 h-auto">
            <div class="flex items-center gap-2">
              <Icon name="i-lucide-filter" class="h-4 w-4" />
              <span class="font-medium">Filtrer les données</span>
            </div>
            <Icon name="i-lucide-chevron-down" class="h-4 w-4 transition-transform duration-200" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent class="px-6 pb-4">
          <DataFilters
            :search="filters.search || ''"
            :selected-types="filters.types || []"
            :selected-categories="filters.categories || []"
            :selected-arrondissements="filters.arrondissements || []"
            :selected-etats="filters.etats || []"
            :type-options="filterOptions.types || []"
            :categorie-options="filterOptions.categories || []"
            :arrondissement-options="filterOptions.arrondissements || []"
            :etat-options="filterOptions.etats || []"
            :show-categorie-filter="showCategorieFilter"
            :show-etat-filter="showEtatFilter"
            @update:search="handleSearchUpdate"
            @update:selected-types="handleTypesUpdate"
            @update:selected-categories="handleCategoriesUpdate"
            @update:selected-arrondissements="handleArrondissementsUpdate"
            @update:selected-etats="handleEtatsUpdate"
            @reset="handleFiltersReset"
          />
        </CollapsibleContent>
      </Collapsible>

      <div class="flex-1 p-6 bg-muted/20">
        <div v-if="loading" class="h-full flex items-center justify-center">
          <div class="text-center space-y-4">
            <Icon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-quantic mx-auto" />
            <p class="text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
        
        <div v-else-if="items.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center space-y-4">
            <Icon name="i-lucide-map-pin-off" class="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 class="text-lg font-medium">Aucune donnée à afficher</h3>
              <p class="text-sm text-muted-foreground">
                Aucun élément ne correspond aux filtres actuels
              </p>
            </div>
          </div>
        </div>

        <MapView
          v-else
          ref="mapView"
          :items="items"
          :height="'calc(90vh - 200px)'"
          :zoom="12"
          :center="[48.8566, 2.3522]"
          :show-clusters="true"
          class="rounded-lg overflow-hidden border"
        />
      </div>

      <div class="px-6 py-4 border-t bg-background flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="refreshMap"
            :disabled="loading || items.length === 0"
          >
            <Icon name="i-lucide-refresh" class="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            @click="centerOnParis"
            :disabled="loading || items.length === 0"
          >
            <Icon name="i-lucide-home" class="w-4 h-4 mr-2" />
            Centrer sur Paris
          </Button>
        </div>

        <Button
          variant="outline"
          @click="isOpen = false"
        >
          Fermer
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.text-quantic {
  color: #5f259f;
}
</style>
