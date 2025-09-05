<script setup lang="ts">
import type { EquipementSportifItem, EspaceVertItem, FontaineItem } from '~/types/datasets'

interface Props {
  open?: boolean
  items?: (EquipementSportifItem | EspaceVertItem | FontaineItem)[]
  title?: string
  loading?: boolean
  currentStore?: 'equipements' | 'espaces-verts' | 'fontaines'
  mapFilters?: any
  filterOptions?: any
  selectedItem?: EquipementSportifItem | EspaceVertItem | FontaineItem | null
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  items: () => [],
  title: 'Carte interactive',
  loading: false,
  currentStore: 'equipements',
  mapFilters: () => ({}),
  filterOptions: () => ({}),
  selectedItem: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:mapFilters': [mapFilters: any]
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
      }
      else if (item.type.toLowerCase().includes('fontaine') || 'etat' in item) {
        itemsByType.fontaines++
      }
      else {
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
  if (props.selectedItem && mapView.value) {
    mapView.value.flyToLocation(props.selectedItem.latitude || 48.8566, props.selectedItem.longitude || 2.3522)
  }
  else if (mapView.value) {
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
  const newFilters = { ...props.mapFilters, search: value }
  emit('update:mapFilters', newFilters)
}

function handleTypesUpdate(value: string[]) {
  const newFilters = { ...props.mapFilters, types: value }
  emit('update:mapFilters', newFilters)
}

function handleCategoriesUpdate(value: string[]) {
  const newFilters = { ...props.mapFilters, categories: value }
  emit('update:mapFilters', newFilters)
}

function handleArrondissementsUpdate(value: string[]) {
  const newFilters = { ...props.mapFilters, arrondissements: value }
  emit('update:mapFilters', newFilters)
}

function handleEtatsUpdate(value: string[]) {
  const newFilters = { ...props.mapFilters, etats: value }
  emit('update:mapFilters', newFilters)
}

function handleFiltersReset() {
  const resetFilters = {
    search: '',
    types: [],
    categories: [],
    arrondissements: [],
    etats: [],
  }
  emit('update:mapFilters', resetFilters)
}

const showCategorieFilter = computed(() => props.currentStore === 'espaces-verts')
const showEtatFilter = computed(() => props.currentStore === 'fontaines')
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90vh] h-auto max-w-7xl w-[95vw] gap-0 p-0 flex flex-col">
      <DialogHeader class="border-b bg-background px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <DialogTitle class="text-quantic text-xl font-bold font-nexa">
              {{ title }}
            </DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground">
              {{ stats.total }} élément{{ stats.total > 1 ? 's' : '' }} affiché{{ stats.total > 1 ? 's' : '' }} sur la carte
            </DialogDescription>
          </div>

          <div class="flex items-center gap-3">
            <div v-if="stats.equipements > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-dumbbell" class="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" class="text-xs">
                {{ stats.equipements }}
              </Badge>
            </div>
            <div v-if="stats.espaces > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-leaf" class="h-4 w-4 text-green-600" />
              <Badge variant="secondary" class="text-xs">
                {{ stats.espaces }}
              </Badge>
            </div>
            <div v-if="stats.fontaines > 0" class="flex items-center gap-1 text-xs">
              <Icon name="i-lucide-droplets" class="h-4 w-4 text-cyan-600" />
              <Badge variant="secondary" class="text-xs">
                {{ stats.fontaines }}
              </Badge>
            </div>
          </div>
        </div>
      </DialogHeader>

      <!-- Filtres toujours visibles -->
      <div class="border-b bg-background px-6 py-4 flex-shrink-0">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="i-lucide-filter" class="h-4 w-4" />
          <span class="font-medium">Filtres</span>
        </div>
        <DataFilters
          :search="mapFilters.search || ''"
          :selected-types="mapFilters.types || []"
          :selected-categories="mapFilters.categories || []"
          :selected-arrondissements="mapFilters.arrondissements || []"
          :selected-etats="mapFilters.etats || []"
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
      </div>

      <!-- Carte avec hauteur réduite -->
      <div class="flex-1 bg-muted/20 p-4 min-h-0 overflow-hidden">
        <div v-if="loading" class="h-full flex items-center justify-center">
          <div class="text-center space-y-4">
            <Icon name="i-lucide-loader-2" class="text-quantic mx-auto h-8 w-8 animate-spin" />
            <p class="text-muted-foreground">
              Chargement de la carte...
            </p>
          </div>
        </div>

        <div v-else-if="items.length === 0" class="h-full flex items-center justify-center">
          <div class="text-center space-y-4">
            <Icon name="i-lucide-map-pin-off" class="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <h3 class="text-lg font-medium">
                Aucune donnée à afficher
              </h3>
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
          height="400px"
          :zoom="props.selectedItem ? 14 : 12"
          :center="props.selectedItem ? [props.selectedItem.latitude || 48.8566, props.selectedItem.longitude || 2.3522] : [48.8566, 2.3522]"
          :show-clusters="!props.selectedItem"
          class="h-[400px] w-full overflow-hidden border rounded-lg"
        />
      </div>

      <div class="flex items-center justify-between border-t bg-background px-6 py-4 flex-shrink-0">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="loading || items.length === 0"
            @click="refreshMap"
          >
            <Icon name="i-lucide-refresh" class="mr-2 h-4 w-4" />
            Actualiser
          </Button>

          <Button
            variant="outline"
            size="sm"
            :disabled="loading || items.length === 0"
            @click="centerOnParis"
          >
            <Icon name="i-lucide-home" class="mr-2 h-4 w-4" />
            {{ props.selectedItem ? 'Centrer sur le point' : 'Centrer sur Paris' }}
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
