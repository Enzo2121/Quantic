<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboardStores } from '@/composables/useDashboardStores'
import { useDashboardUtils } from '@/composables/useDashboardUtils'

definePageMeta({
  title: 'Points Frais - Open Data Paris',
  layout: 'default',
})

useHead({
  title: 'Points Frais - Quantic',
  meta: [
    { name: 'description', content: 'Points frais d\'exploration des données Open Data de Paris' },
  ],
})

const { equipementsStore, espacesVertsStore, fontainesStore, stats, initializeStores, loadStoreData } = useDashboardStores()
const { getEquipementCellValue, getEspaceVertCellValue, getFontaineCellValue, equipementsColumns, espacesVertsColumns, fontainesColumns } = useDashboardUtils()

const activeTab = ref('equipements')
const isMapModalOpen = ref(false)
const selectedMapItem = ref<any>(null)

onMounted(async () => {
  try {
    await initializeStores()
  }
  catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
  }
})

watch(activeTab, async (newTab) => {
  if (newTab === 'espaces-verts') {
    await loadStoreData('espaces-verts')
  }

  if (newTab === 'fontaines') {
    await loadStoreData('fontaines')
  }
})

async function handleEquipementsSearch(value: string) {
  await equipementsStore.updateFilters({ search: value })
}

async function handleEquipementsTypes(value: string[]) {
  await equipementsStore.updateFilters({ types: value })
}

async function handleEquipementsArrondissements(value: string[]) {
  await equipementsStore.updateFilters({ arrondissements: value })
}

function handleEquipementsSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  equipementsStore.updateSort(sortBy, sortOrder)
}

function handleEquipementsPage(page: number) {
  equipementsStore.updatePagination(page)
}

function handleEquipementsPageSize(pageSize: number) {
  equipementsStore.updatePagination(1, pageSize)
}

function handleEquipementsReset() {
  equipementsStore.reset()
}

const showFloatingButton = computed(() =>
  ['equipements', 'espaces-verts', 'fontaines'].includes(activeTab.value),
)

const currentStoreData = computed(() => {
  switch (activeTab.value) {
    case 'equipements':
      return {
        data: equipementsStore.filteredData,
        loading: equipementsStore.loading,
        name: 'équipements sportifs',
        searchParams: equipementsStore.filters,
        filterOptions: equipementsStore.filterOptions,
      }
    case 'espaces-verts':
      return {
        data: espacesVertsStore.filteredData,
        loading: espacesVertsStore.loading,
        name: 'espaces verts',
        searchParams: espacesVertsStore.filters,
        filterOptions: espacesVertsStore.filterOptions,
      }
    case 'fontaines':
      return {
        data: fontainesStore.filteredData,
        loading: fontainesStore.loading,
        name: 'fontaines à boire',
        searchParams: fontainesStore.filters,
        filterOptions: fontainesStore.filterOptions,
      }
    default:
      return {
        data: [],
        loading: false,
        name: '',
        searchParams: {},
        filterOptions: {},
      }
  }
})

const mapModalTitle = computed(() =>
  `Carte des ${currentStoreData.value.name} - ${currentStoreData.value.data.length} résultat${currentStoreData.value.data.length > 1 ? 's' : ''}`,
)

function openMapModal() {
  selectedMapItem.value = null
  isMapModalOpen.value = true
}

function handleOpenMapModal(item: any) {
  selectedMapItem.value = item
  isMapModalOpen.value = true
}
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4" />
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid grid-cols-3 h-16 w-full p-1">
        <TabsTrigger
          value="equipements"
          class="h-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
        >
          <Icon name="i-lucide-dumbbell" class="h-4 w-4 flex-shrink-0" />
          <span class="hidden truncate sm:inline">Équipements sportifs</span>
          <span class="truncate sm:hidden">Équipements</span>
          <Badge variant="secondary" class="ml-1 flex-shrink-0 text-xs">
            {{ stats.equipements.total }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="espaces-verts"
          class="h-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
        >
          <Icon name="i-lucide-leaf" class="h-4 w-4 flex-shrink-0" />
          <span class="hidden truncate sm:inline">Espaces verts</span>
          <span class="truncate sm:hidden">Espaces</span>
          <Badge variant="secondary" class="ml-1 flex-shrink-0 text-xs">
            {{ stats.espacesVerts.total }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="fontaines"
          class="h-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
        >
          <Icon name="i-lucide-droplets" class="h-4 w-4 flex-shrink-0" />
          <span class="hidden truncate sm:inline">Fontaines à boire</span>
          <span class="truncate sm:hidden">Fontaines</span>
          <Badge variant="secondary" class="ml-1 flex-shrink-0 text-xs">
            {{ stats.fontaines.total }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="equipements" class="space-y-6">
        <Card>
          <CardContent class="space-y-6 mt-2">
            <div class="dashboard-filters">
              <DataFilters
                :search="(() => equipementsStore.filters.search)()"
                :selected-types="(() => equipementsStore.filters.types)()"
                :selected-arrondissements="(() => equipementsStore.filters.arrondissements)()"
                :type-options="equipementsStore.filterOptions.types"
                :arrondissement-options="equipementsStore.filterOptions.arrondissements"
                :is-loading-options="equipementsStore.isLoadingOptions"
                @update:search="handleEquipementsSearch"
                @update:selected-types="handleEquipementsTypes"
                @update:selected-arrondissements="handleEquipementsArrondissements"
                @reset="handleEquipementsReset"
              />
            </div>

            <LoadingState
              :loading="equipementsStore.loading"
              type="table"
              :rows="equipementsStore.pagination.pageSize"
              :columns="equipementsColumns.length"
            >
              <DataTable
                :data="equipementsStore.currentPageData"
                :loading="equipementsStore.loading"
                :pagination="equipementsStore.pagination"
                :sort-by="equipementsStore.sortBy"
                :sort-order="equipementsStore.sortOrder"
                :columns="equipementsColumns"
                :get-cell-value="getEquipementCellValue"
                @update:page="handleEquipementsPage"
                @update:page-size="handleEquipementsPageSize"
                @update:sort="handleEquipementsSort"
                @open-map-modal="handleOpenMapModal"
              />
            </LoadingState>

          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="espaces-verts" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-leaf" class="h-5 w-5" />
              Espaces verts de Paris
            </CardTitle>
            <CardDescription>
              Explorez les parcs, jardins et espaces verts de la capitale
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="dashboard-filters">
              <DataFilters
                :search="espacesVertsStore.filters.search"
                :selected-types="espacesVertsStore.filters.types"
                :selected-categories="espacesVertsStore.filters.categories"
                :selected-arrondissements="espacesVertsStore.filters.arrondissements"
                :type-options="espacesVertsStore.filterOptions.types"
                :categorie-options="espacesVertsStore.filterOptions.categories"
                :arrondissement-options="espacesVertsStore.filterOptions.arrondissements"
                :show-categorie-filter="true"
                :is-loading-options="espacesVertsStore.isLoadingOptions"
                @update:search="handleEspacesVertsSearch"
                @update:selected-types="handleEspacesVertsTypes"
                @update:selected-categories="handleEspacesVertsCategories"
                @update:selected-arrondissements="handleEspacesVertsArrondissements"
                @reset="handleEspacesVertsReset"
              />
            </div>

            <LoadingState
              :loading="espacesVertsStore.loading"
              type="table"
              :rows="espacesVertsStore.pagination.pageSize"
              :columns="espacesVertsColumns.length"
            >
              <DataTable
                :data="espacesVertsStore.currentPageData"
                :loading="espacesVertsStore.loading"
                :pagination="espacesVertsStore.pagination"
                :sort-by="espacesVertsStore.sortBy"
                :sort-order="espacesVertsStore.sortOrder"
                :columns="espacesVertsColumns"
                :get-cell-value="getEspaceVertCellValue"
                @update:page="handleEspacesVertsPage"
                @update:page-size="handleEspacesVertsPageSize"
                @update:sort="handleEspacesVertsSort"
                @open-map-modal="handleOpenMapModal"
              />
            </LoadingState>

          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fontaines" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-droplets" class="h-5 w-5" />
              Fontaines à boire de Paris
            </CardTitle>
            <CardDescription>
              Localisez les fontaines à boire dans tous les arrondissements parisiens
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="dashboard-filters">
              <DataFilters
                :search="fontainesStore.filters.search"
                :selected-types="fontainesStore.filters.types"
                :selected-arrondissements="fontainesStore.filters.arrondissements"
                :selected-etats="fontainesStore.filters.etats"
                :type-options="fontainesStore.filterOptions.types"
                :arrondissement-options="fontainesStore.filterOptions.arrondissements"
                :etat-options="fontainesStore.filterOptions.etats"
                :show-etat-filter="true"
                :is-loading-options="fontainesStore.isLoadingOptions"
                @update:search="handleFontainesSearch"
                @update:selected-types="handleFontainesTypes"
                @update:selected-arrondissements="handleFontainesArrondissements"
                @update:selected-etats="handleFontainesEtats"
                @reset="handleFontainesReset"
              />
            </div>

            <LoadingState
              :loading="fontainesStore.loading"
              type="table"
              :rows="fontainesStore.pagination.pageSize"
              :columns="fontainesColumns.length"
            >
              <DataTable
                :data="fontainesStore.currentPageData"
                :loading="fontainesStore.loading"
                :pagination="fontainesStore.pagination"
                :sort-by="fontainesStore.sortBy"
                :sort-order="fontainesStore.sortOrder"
                :columns="fontainesColumns"
                :get-cell-value="getFontaineCellValue"
                @update:page="handleFontainesPage"
                @update:page-size="handleFontainesPageSize"
                @update:sort="handleFontainesSort"
                @open-map-modal="handleOpenMapModal"
              />
            </LoadingState>

          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <FloatingMapButton
      :visible="showFloatingButton"
      :item-count="currentStoreData.data.length"
      :loading="currentStoreData.loading"
      @open-map="openMapModal"
    />

    <MapModal
      v-model:open="isMapModalOpen"
      :items="selectedMapItem ? [selectedMapItem] : currentStoreData.data"
      :title="selectedMapItem ? `${selectedMapItem.nom || selectedMapItem.adresse || 'Point sélectionné'}` : mapModalTitle"
      :loading="currentStoreData.loading"
      :current-store="activeTab as 'equipements' | 'espaces-verts' | 'fontaines'"
      :map-filters="currentStoreData.searchParams"
      :filter-options="currentStoreData.filterOptions"
      :selected-item="selectedMapItem"
    />
  </div>
</template>
