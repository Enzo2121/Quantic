<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import UnifiedDataFilters from '@/components/UnifiedDataFilters.vue'
import type { UnifiedDataItem } from '~/types/datasets'

definePageMeta({
  title: 'Recherche Unifiée - Open Data Paris',
  layout: 'default',
})

useHead({
  title: 'Recherche Unifiée - Quantic',
  meta: [
    { name: 'description', content: 'Recherche et filtrage unifié dans tous les datasets Open Data de Paris' },
  ],
})

const unifiedStore = useUnifiedDataStore()

// État pour la modal de carte
const isMapModalOpen = ref(false)
const selectedMapItem = ref<UnifiedDataItem | null>(null)

// Charger les données au montage
onMounted(async () => {
  if (!unifiedStore.isLoaded) {
    await unifiedStore.loadAllData()
  }
})

// Gestionnaires d'événements
async function handleFiltersUpdate(newFilters: any) {
  await unifiedStore.updateFilters(newFilters)
}

function handleReset() {
  unifiedStore.reset()
}

// Gestionnaire pour ouvrir la modal de carte
function handleOpenMapModal(item: UnifiedDataItem) {
  selectedMapItem.value = item
  isMapModalOpen.value = true
}

// Gestionnaire pour le tri
function handleSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  unifiedStore.sort.sortBy = sortBy
  unifiedStore.sort.sortOrder = sortOrder
}

// Gestionnaire pour la pagination
function handlePageChange(page: number) {
  unifiedStore.pagination.page = page
}

function handlePageSizeChange(pageSize: number) {
  unifiedStore.pagination.pageSize = pageSize
  unifiedStore.pagination.page = 1 // Reset à la première page
}

// Fonction pour obtenir la valeur d'une cellule selon le type de données
function getCellValue(item: UnifiedDataItem, column: string): any {
  switch (column) {
    case 'nom':
      return item.nom
    case 'type':
      return item.type
    case 'adresse':
      return item.adresse
    case 'arrondissement':
      return item.arrondissement
    case 'source':
      return getSourceLabel(item.source)
    case 'details':
      return getItemDetails(item)
    default:
      return (item as any)[column] || '-'
  }
}

function getSourceLabel(source: string): string {
  switch (source) {
    case 'equipements':
      return 'Équipements sportifs'
    case 'espaces-verts':
      return 'Espaces verts'
    case 'fontaines':
      return 'Fontaines à boire'
    default:
      return source
  }
}

function getItemDetails(item: UnifiedDataItem): string {
  const details = []
  
  if (item.categorie) details.push(`Catégorie: ${item.categorie}`)
  if (item.etat) details.push(`État: ${item.etat}`)
  if (item.payant) details.push(`Tarif: ${item.payant}`)
  if (item.superficie) details.push(`Surface: ${item.superficie}m²`)
  if (item.ouvert_24h === 'Oui') details.push('Ouvert 24h/24')
  
  return details.join(' • ') || 'Aucun détail'
}

function getSourceIcon(source: string): string {
  switch (source) {
    case 'equipements':
      return 'i-lucide-dumbbell'
    case 'espaces-verts':
      return 'i-lucide-leaf'
    case 'fontaines':
      return 'i-lucide-droplets'
    default:
      return 'i-lucide-map-pin'
  }
}

function getSourceColor(source: string): string {
  switch (source) {
    case 'equipements':
      return 'bg-violet-100 text-violet-800'
    case 'espaces-verts':
      return 'bg-green-100 text-green-800'
    case 'fontaines':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const columns = ['nom', 'type', 'adresse', 'arrondissement', 'source', 'details']

// Stats rapides
const quickStats = computed(() => {
  return {
    total: unifiedStore.filteredData.length,
    equipements: unifiedStore.filteredData.filter(item => item.source === 'equipements').length,
    espacesVerts: unifiedStore.filteredData.filter(item => item.source === 'espaces-verts').length,
    fontaines: unifiedStore.filteredData.filter(item => item.source === 'fontaines').length,
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <!-- En-tête -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-nexa text-3xl font-bold tracking-tight text-violet">
          Recherche Unifiée
        </h1>
        <p class="mt-2 text-muted-foreground">
          Recherchez et filtrez simultanément dans tous les datasets Open Data de Paris
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="navigateTo('/pointFrais')">
          <Icon name="i-lucide-arrow-left" class="mr-2 h-4 w-4" />
          Retour aux points frais
        </Button>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent class="flex flex-col items-center justify-center p-6">
          <div class="text-2xl font-bold text-violet">{{ quickStats.total }}</div>
          <div class="text-sm text-muted-foreground">Total des résultats</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="flex flex-col items-center justify-center p-6">
          <div class="text-2xl font-bold text-violet-600">{{ quickStats.equipements }}</div>
          <div class="text-sm text-muted-foreground">Équipements sportifs</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="flex flex-col items-center justify-center p-6">
          <div class="text-2xl font-bold text-green-600">{{ quickStats.espacesVerts }}</div>
          <div class="text-sm text-muted-foreground">Espaces verts</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="flex flex-col items-center justify-center p-6">
          <div class="text-2xl font-bold text-blue-600">{{ quickStats.fontaines }}</div>
          <div class="text-sm text-muted-foreground">Fontaines à boire</div>
        </CardContent>
      </Card>
    </div>

    <!-- Filtres -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon name="i-lucide-filter" class="h-5 w-5" />
          Filtres de recherche unifiée
        </CardTitle>
        <CardDescription>
          Filtrez et recherchez simultanément dans tous les datasets disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UnifiedDataFilters
          :filters="unifiedStore.filters"
          :filter-options="unifiedStore.filterOptions"
          :is-loading-options="unifiedStore.loading"
          @update:filters="handleFiltersUpdate"
          @reset="handleReset"
        />
      </CardContent>
    </Card>

    <!-- Résultats -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Icon name="i-lucide-list" class="h-5 w-5" />
            Résultats de recherche
          </span>
          <Badge variant="secondary">
            {{ quickStats.total }} résultat{{ quickStats.total > 1 ? 's' : '' }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState
          :loading="unifiedStore.loading"
          type="table"
          :rows="unifiedStore.pagination.pageSize"
          :columns="columns.length"
        >
          <div v-if="unifiedStore.currentPageData.length === 0 && !unifiedStore.loading" class="text-center py-8">
            <Icon name="i-lucide-search-x" class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-lg font-medium">Aucun résultat trouvé</p>
            <p class="text-muted-foreground">Essayez de modifier vos filtres ou votre recherche</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Vue en cartes pour mobile -->
            <div class="block md:hidden space-y-4">
              <div
                v-for="item in unifiedStore.currentPageData"
                :key="item.id"
                class="border rounded-lg p-4 space-y-2"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ item.nom }}</h3>
                    <p class="text-sm text-muted-foreground">{{ item.adresse }}</p>
                  </div>
                  <Badge :class="getSourceColor(item.source)" class="ml-2">
                    <Icon :name="getSourceIcon(item.source)" class="mr-1 h-3 w-3" />
                    {{ getSourceLabel(item.source) }}
                  </Badge>
                </div>
                <div class="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">{{ item.type }}</Badge>
                  <Badge variant="outline">{{ item.arrondissement }}</Badge>
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ getItemDetails(item) }}
                </div>
              </div>
            </div>

            <!-- Vue tableau pour desktop -->
            <div class="hidden md:block">
              <DataTable
                :data="unifiedStore.currentPageData"
                :loading="unifiedStore.loading"
                :pagination="unifiedStore.pagination"
                :sort-by="unifiedStore.sort.sortBy"
                :sort-order="unifiedStore.sort.sortOrder"
                :columns="columns"
                :get-cell-value="getCellValue"
                @update:page="handlePageChange"
                @update:page-size="handlePageSizeChange"
                @update:sort="handleSort"
                @open-map-modal="handleOpenMapModal"
              >
                <template #cell-source="{ value, item }">
                  <Badge :class="getSourceColor(item.source)">
                    <Icon :name="getSourceIcon(item.source)" class="mr-1 h-3 w-3" />
                    {{ value }}
                  </Badge>
                </template>
              </DataTable>
            </div>
          </div>
        </LoadingState>
      </CardContent>
    </Card>

    <!-- Modal de carte -->
    <MapModal
      v-model:open="isMapModalOpen"
      :items="selectedMapItem ? [selectedMapItem] : []"
      :title="selectedMapItem ? selectedMapItem.nom : 'Point sélectionné'"
      :loading="false"
      :current-store="selectedMapItem?.source as 'equipements' | 'espaces-verts' | 'fontaines'"
      :map-filters="unifiedStore.filters"
      :filter-options="unifiedStore.filterOptions"
      :selected-item="selectedMapItem"
      @update:filters="handleFiltersUpdate"
    />
  </div>
</template>