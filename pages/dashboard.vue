<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboardStores } from '@/composables/useDashboardStores'
import { useDashboardUtils } from '@/composables/useDashboardUtils'

definePageMeta({
  title: 'Dashboard - Open Data Paris',
  layout: 'default',
})

useHead({
  title: 'Dashboard - Quantic',
  meta: [
    { name: 'description', content: 'Dashboard d\'exploration des données Open Data de Paris' },
  ],
})

const { equipementsStore, espacesVertsStore, fontainesStore, stats, initializeStores, loadStoreData } = useDashboardStores()
const { getEquipementCellValue, getEspaceVertCellValue, getFontaineCellValue, equipementsColumns, espacesVertsColumns, fontainesColumns } = useDashboardUtils()

const activeTab = ref('equipements')

watch(activeTab, async (newTab) => {
  if (newTab === 'equipements') {
    await prefetchComponents(['LazyDataTable'])
  }
})

const showSports = ref(true)
const showParks = ref(true)
const showFountains = ref(true)
const selectedDistrict = ref('all')
const mapCenter = ref<[number, number]>([48.8566, 2.3522])
const mapView = ref()

const isMapModalOpen = ref(false)

const districtOptions = [
  '75001',
  '75002',
  '75003',
  '75004',
  '75005',
  '75006',
  '75007',
  '75008',
  '75009',
  '75010',
  '75011',
  '75012',
  '75013',
  '75014',
  '75015',
  '75016',
  '75017',
  '75018',
  '75019',
  '75020',
]

const filteredMapItems = computed(() => {
  const items: any[] = []

  if (showSports.value && equipementsStore.isLoaded && equipementsStore.currentPageData.length > 0) {
    items.push(...equipementsStore.currentPageData)
  }

  if (showParks.value && espacesVertsStore.isLoaded && espacesVertsStore.currentPageData.length > 0) {
    items.push(...espacesVertsStore.currentPageData)
  }

  if (showFountains.value && fontainesStore.isLoaded && fontainesStore.currentPageData.length > 0) {
    items.push(...fontainesStore.currentPageData)
  }

  return items
})

async function refreshMap() {
  console.warn('Actualisation de la carte...')

  if (showSports.value && !equipementsStore.isLoaded) {
    await equipementsStore.fetchPage(1)
  }
  if (showParks.value && !espacesVertsStore.isLoaded) {
    await espacesVertsStore.fetchPage(1)
  }
  if (showFountains.value && !fontainesStore.isLoaded) {
    await fontainesStore.fetchPage(1)
  }

  mapCenter.value = [48.8566, 2.3522]

  setTimeout(() => {
    if (mapView.value) {
      mapView.value.flyToLocation(48.8566, 2.3522)
    }
  }, 100)

  setTimeout(() => {
    if (mapView.value) {
      mapView.value.invalidateSize()
    }
  }, 200)
}

function centerOnParis() {
  mapCenter.value = [48.8566, 2.3522]
  if (mapView.value) {
    mapView.value.flyToLocation(48.8566, 2.3522)
  }
}

onMounted(async () => {
  try {
    await initializeStores()

    if (activeTab.value === 'carte') {
      console.warn('Centrage initial sur Paris (onMounted)')
      mapCenter.value = [48.8566, 2.3522]

      setTimeout(() => {
        if (mapView.value) {
          mapView.value.flyToLocation(48.8566, 2.3522)
        }
      }, 500)
    }
  } catch (error) {
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

  if (newTab === 'carte') {
    console.warn('Navigation vers onglet Carte Interactive')

    nextTick(async () => {
      await refreshMap()

      setTimeout(() => {
        console.warn('Centrage automatique sur Paris (délai)')
        mapCenter.value = [48.8566, 2.3522]

        if (mapView.value) {
          mapView.value.flyToLocation(48.8566, 2.3522)
        }

        setTimeout(() => {
          if (mapView.value) {
            mapView.value.invalidateSize()
          }
        }, 200)
      }, 300)
    })
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

async function handleEspacesVertsSearch(value: string) {
  await espacesVertsStore.updateFilters({ search: value })
}

async function handleEspacesVertsTypes(value: string[]) {
  await espacesVertsStore.updateFilters({ types: value })
}

async function handleEspacesVertsCategories(value: string[]) {
  await espacesVertsStore.updateFilters({ categories: value })
}

async function handleEspacesVertsArrondissements(value: string[]) {
  await espacesVertsStore.updateFilters({ arrondissements: value })
}

function handleEspacesVertsSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  espacesVertsStore.updateSort(sortBy, sortOrder)
}

function handleEspacesVertsPage(page: number) {
  espacesVertsStore.updatePagination(page)
}

function handleEspacesVertsPageSize(pageSize: number) {
  espacesVertsStore.updatePagination(1, pageSize)
}

function handleEspacesVertsReset() {
  espacesVertsStore.reset()
}

async function handleFontainesSearch(value: string) {
  await fontainesStore.updateFilters({ search: value })
}

async function handleFontainesTypes(value: string[]) {
  await fontainesStore.updateFilters({ types: value })
}

async function handleFontainesArrondissements(value: string[]) {
  await fontainesStore.updateFilters({ arrondissements: value })
}

async function handleFontainesEtats(value: string[]) {
  await fontainesStore.updateFilters({ etats: value })
}

function handleFontainesSort(sortBy: string, sortOrder: 'asc' | 'desc') {
  fontainesStore.updateSort(sortBy, sortOrder)
}

function handleFontainesPage(page: number) {
  fontainesStore.updatePagination(page)
}

function handleFontainesPageSize(pageSize: number) {
  fontainesStore.updatePagination(1, pageSize)
}

function handleFontainesReset() {
  fontainesStore.reset()
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
        filters: equipementsStore.filters,
        filterOptions: equipementsStore.filterOptions,
      }
    case 'espaces-verts':
      return {
        data: espacesVertsStore.filteredData,
        loading: espacesVertsStore.loading,
        name: 'espaces verts',
        filters: espacesVertsStore.filters,
        filterOptions: espacesVertsStore.filterOptions,
      }
    case 'fontaines':
      return {
        data: fontainesStore.filteredData,
        loading: fontainesStore.loading,
        name: 'fontaines à boire',
        filters: fontainesStore.filters,
        filterOptions: fontainesStore.filterOptions,
      }
    default:
      return {
        data: [],
        loading: false,
        name: '',
        filters: {},
        filterOptions: {},
      }
  }
})

const mapModalTitle = computed(() =>
  `Carte des ${currentStoreData.value.name} - ${currentStoreData.value.data.length} résultat${currentStoreData.value.data.length > 1 ? 's' : ''}`,
)

function openMapModal() {
  isMapModalOpen.value = true
}

async function handleModalFiltersUpdate(newFilters: any) {
  switch (activeTab.value) {
    case 'equipements':
      await equipementsStore.updateFilters(newFilters)
      break
    case 'espaces-verts':
      await espacesVertsStore.updateFilters(newFilters)
      break
    case 'fontaines':
      await fontainesStore.updateFilters(newFilters)
      break
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-6">

    <div class="flex flex-wrap items-center justify-between gap-4">
      <AppHeader />
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="navigateTo('/analytics')">
          <Icon name="i-lucide-bar-chart-3" class="h-4 w-4 mr-2" />
          Analyses
        </Button>
      </div>
    </div>



    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4 h-16 p-2">
        <TabsTrigger
          value="equipements"
          class="flex items-center gap-3 px-6 py-4 text-base font-medium"
        >
          <Icon name="i-lucide-dumbbell" class="h-5 w-5" />
          <span class="hidden sm:inline">Équipements sportifs</span>
          <span class="sm:hidden">Équipements</span>
          <Badge variant="secondary" class="ml-2">
            {{ stats.equipements.total }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="carte"
          class="flex items-center gap-3 px-6 py-4 text-base font-medium"
        >
          <Icon name="i-lucide-map" class="h-5 w-5" />
          <span class="hidden sm:inline">Carte interactive</span>
          <span class="sm:hidden">Carte</span>
        </TabsTrigger>
        <TabsTrigger
          value="espaces-verts"
          class="flex items-center gap-3 px-6 py-4 text-base font-medium"
        >
          <Icon name="i-lucide-leaf" class="h-5 w-5" />
          <span class="hidden sm:inline">Espaces verts</span>
          <span class="sm:hidden">Espaces</span>
          <Badge variant="secondary" class="ml-2">
            {{ stats.espacesVerts.total }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="fontaines"
          class="flex items-center gap-3 px-6 py-4 text-base font-medium"
        >
          <Icon name="i-lucide-droplets" class="h-5 w-5" />
          <span class="hidden sm:inline">Fontaines à boire</span>
          <span class="sm:hidden">Fontaines</span>
          <Badge variant="secondary" class="ml-2">
            {{ stats.fontaines.total }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="equipements" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-dumbbell" class="h-5 w-5" />
              Équipements sportifs de Paris
            </CardTitle>
            <CardDescription>
              Découvrez tous les équipements sportifs disponibles dans les différents arrondissements de Paris
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="dashboard-filters">
              <DataFilters
                :search="equipementsStore.filters.search"
                :selected-types="equipementsStore.filters.types"
                :selected-arrondissements="equipementsStore.filters.arrondissements"
                :type-options="equipementsStore.filterOptions.types"
                :arrondissement-options="equipementsStore.filterOptions.arrondissements"
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
              />
            </LoadingState>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="carte" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-map" class="h-5 w-5" />
              Carte Interactive de Paris
            </CardTitle>
            <CardDescription>
              Visualisez tous les équipements sportifs, espaces verts et fontaines sur une carte interactive
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label>Type d'équipements à afficher</Label>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-violet-100 border-violet-300': showSports }"
                    @click="showSports = !showSports"
                  >
                    <Icon name="i-lucide-dumbbell" class="w-4 h-4 mr-2" />
                    Sports
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-green-100 border-green-300': showParks }"
                    @click="showParks = !showParks"
                  >
                    <Icon name="i-lucide-leaf" class="w-4 h-4 mr-2" />
                    Parcs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-blue-100 border-blue-300': showFountains }"
                    @click="showFountains = !showFountains"
                  >
                    <Icon name="i-lucide-droplets" class="w-4 h-4 mr-2" />
                    Fontaines
                  </Button>
                </div>
              </div>

              <div class="space-y-2">
                <Label>Filtre par arrondissement</Label>
                <Select v-model="selectedDistrict">
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les arrondissements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les arrondissements</SelectItem>
                    <SelectItem v-for="district in districtOptions" :key="district" :value="district">
                      {{ district }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Actions</Label>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="refreshMap">
                    <Icon name="i-lucide-refresh" class="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button variant="outline" size="sm" @click="centerOnParis">
                    <Icon name="i-lucide-home" class="w-4 h-4 mr-2" />
                    Paris centre
                  </Button>
                </div>
              </div>
            </div>

            <MapView
              ref="mapView"
              :items="filteredMapItems"
              height="600px"
              :center="mapCenter"
            />

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-violet-50 rounded-lg">
                <div class="text-2xl font-bold text-violet-600">{{ filteredMapItems.filter(item => 'payant' in item).length }}</div>
                <div class="text-sm text-gray-600">Équipements sportifs</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ filteredMapItems.filter(item => 'superficie' in item).length }}</div>
                <div class="text-sm text-gray-600">Espaces verts</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ filteredMapItems.filter(item => 'etat' in item).length }}</div>
                <div class="text-sm text-gray-600">Fontaines</div>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-600">{{ filteredMapItems.length }}</div>
                <div class="text-sm text-gray-600">Total affiché</div>
              </div>
            </div>
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
      :items="currentStoreData.data"
      :title="mapModalTitle"
      :loading="currentStoreData.loading"
      :current-store="activeTab as 'equipements' | 'espaces-verts' | 'fontaines'"
      :filters="currentStoreData.filters"
      :filter-options="currentStoreData.filterOptions"
      @update:filters="handleModalFiltersUpdate"
    />
  </div>
</template>
