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

// Computed pour les options de filtres avec valeurs par défaut sécurisées
const safeEquipementsFilterOptions = computed(() => ({
  types: equipementsStore.filterOptions?.types || [],
  arrondissements: equipementsStore.filterOptions?.arrondissements || [],
  tarifs: equipementsStore.filterOptions?.tarifs || [],
  horaires: equipementsStore.filterOptions?.horaires || [],
}))

const safeEspacesVertsFilterOptions = computed(() => ({
  types: espacesVertsStore.filterOptions?.types || [],
  categories: espacesVertsStore.filterOptions?.categories || [],
  arrondissements: espacesVertsStore.filterOptions?.arrondissements || [],
  horaires: espacesVertsStore.filterOptions?.horaires || [],
}))

const safeFontainesFilterOptions = computed(() => ({
  types: fontainesStore.filterOptions?.types || [],
  arrondissements: fontainesStore.filterOptions?.arrondissements || [],
  etats: fontainesStore.filterOptions?.etats || [],
}))

// Computed pour les filtres avec valeurs par défaut sécurisées
const safeEquipementsFilters = computed(() => ({
  search: equipementsStore.filters?.search || '',
  types: equipementsStore.filters?.types || [],
  arrondissements: equipementsStore.filters?.arrondissements || [],
  tarifs: equipementsStore.filters?.tarifs || [],
  horaires: equipementsStore.filters?.horaires || [],
}))

const safeEspacesVertsFilters = computed(() => ({
  search: espacesVertsStore.filters?.search || '',
  types: espacesVertsStore.filters?.types || [],
  categories: espacesVertsStore.filters?.categories || [],
  arrondissements: espacesVertsStore.filters?.arrondissements || [],
  horaires: espacesVertsStore.filters?.horaires || [],
}))

const safeFontainesFilters = computed(() => ({
  search: fontainesStore.filters?.search || '',
  types: fontainesStore.filters?.types || [],
  arrondissements: fontainesStore.filters?.arrondissements || [],
  etats: fontainesStore.filters?.etats || [],
}))

onMounted(async () => {
  try {
    await initializeStores()
  }
  catch (error) {
    // Silently handle initialization errors
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

async function handleEquipementsTarifs(value: string[]) {
  await equipementsStore.updateFilters({ tarifs: value })
}

async function handleEquipementsHoraires(value: string[]) {
  await equipementsStore.updateFilters({ horaires: value })
}

// Removed handleEquipementsAccessibilite function

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
        data: equipementsStore.filteredData || [],
        loading: equipementsStore.loading,
        name: 'équipements sportifs',
        searchParams: safeEquipementsFilters.value,
        filterOptions: safeEquipementsFilterOptions.value,
      }
    case 'espaces-verts':
      return {
        data: espacesVertsStore.filteredData || [],
        loading: espacesVertsStore.loading,
        name: 'espaces verts',
        searchParams: safeEspacesVertsFilters.value,
        filterOptions: safeEspacesVertsFilterOptions.value,
      }
    case 'fontaines':
      return {
        data: fontainesStore.filteredData || [],
        loading: fontainesStore.loading,
        name: 'fontaines à boire',
        searchParams: safeFontainesFilters.value,
        filterOptions: safeFontainesFilterOptions.value,
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

// Gestionnaire pour les changements de filtres depuis la carte
async function handleMapFiltersUpdate(newFilters: any) {
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

// Gestionnaires manquants pour espaces verts
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

async function handleEspacesVertsHoraires(value: string[]) {
  await espacesVertsStore.updateFilters({ horaires: value })
}

// Removed handleEspacesVertsAccessibilite function

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

// Gestionnaires manquants pour fontaines
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

// Removed handleFontainesAccessibilite function

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
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-nexa text-3xl font-bold tracking-tight text-black">
          Points Frais
        </h1>
        <p class="mt-2 text-muted-foreground">
          Explorez les équipements urbains et points de fraîcheur de Paris
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="default" class="bg-quantic hover:bg-quantic/90" @click="navigateTo('/search')">
          <Icon name="i-lucide-search" class="mr-2 h-4 w-4" />
          Recherche unifiée
        </Button>
      </div>
    </div>
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
            {{ stats.equipements.total || 0 }}
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
            {{ stats.espacesVerts.total || 0 }}
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
            {{ stats.fontaines.total || 0 }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="equipements" class="space-y-6">
        <Card>
          <CardContent class="space-y-6 mt-2">
            <div class="dashboard-filters">
              <DataFilters
                :search="safeEquipementsFilters.search"
                :selected-types="safeEquipementsFilters.types"
                :selected-arrondissements="safeEquipementsFilters.arrondissements"
                :selected-tarifs="safeEquipementsFilters.tarifs"
                :selected-horaires="safeEquipementsFilters.horaires"
                :type-options="safeEquipementsFilterOptions.types"
                :arrondissement-options="safeEquipementsFilterOptions.arrondissements"
                :tarif-options="safeEquipementsFilterOptions.tarifs"
                :horaire-options="safeEquipementsFilterOptions.horaires"
                :show-tarif-filter="true"
                :show-horaire-filter="true"
                :is-loading-options="equipementsStore.isLoadingOptions"
                @update:search="handleEquipementsSearch"
                @update:selected-types="handleEquipementsTypes"
                @update:selected-arrondissements="handleEquipementsArrondissements"
                @update:selected-tarifs="handleEquipementsTarifs"
                @update:selected-horaires="handleEquipementsHoraires"
                @reset="handleEquipementsReset"
              />
            </div>

            <LoadingState
              :loading="equipementsStore.loading"
              type="table"
              :rows="equipementsStore.pagination?.pageSize || 20"
              :columns="equipementsColumns.length"
            >
              <DataTable
                :data="equipementsStore.currentPageData || []"
                :loading="equipementsStore.loading"
                :pagination="equipementsStore.pagination"
                :sort-by="equipementsStore.sortBy"
                :sort-order="equipementsStore.sortOrder"
                :columns="equipementsColumns"
                :get-cell-value="getEquipementCellValue"
                @update:page="handleEquipementsPage"
                @update:page-size="handleEquipementsPageSize"
                @update:sort="handleEquipementsSort"
                @openMapModal="handleOpenMapModal"
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
                :search="safeEspacesVertsFilters.search"
                :selected-types="safeEspacesVertsFilters.types"
                :selected-categories="safeEspacesVertsFilters.categories"
                :selected-arrondissements="safeEspacesVertsFilters.arrondissements"
                :selected-horaires="safeEspacesVertsFilters.horaires"
                :type-options="safeEspacesVertsFilterOptions.types"
                :categorie-options="safeEspacesVertsFilterOptions.categories"
                :arrondissement-options="safeEspacesVertsFilterOptions.arrondissements"
                :horaire-options="safeEspacesVertsFilterOptions.horaires"
                :show-categorie-filter="true"
                :show-horaire-filter="true"
                :is-loading-options="espacesVertsStore.isLoadingOptions"
                @update:search="handleEspacesVertsSearch"
                @update:selected-types="handleEspacesVertsTypes"
                @update:selected-categories="handleEspacesVertsCategories"
                @update:selected-arrondissements="handleEspacesVertsArrondissements"
                @update:selected-horaires="handleEspacesVertsHoraires"
                @reset="handleEspacesVertsReset"
              />
            </div>

            <LoadingState
              :loading="espacesVertsStore.loading"
              type="table"
              :rows="espacesVertsStore.pagination?.pageSize || 20"
              :columns="espacesVertsColumns.length"
            >
              <DataTable
                :data="espacesVertsStore.currentPageData || []"
                :loading="espacesVertsStore.loading"
                :pagination="espacesVertsStore.pagination"
                :sort-by="espacesVertsStore.sortBy"
                :sort-order="espacesVertsStore.sortOrder"
                :columns="espacesVertsColumns"
                :get-cell-value="getEspaceVertCellValue"
                @update:page="handleEspacesVertsPage"
                @update:page-size="handleEspacesVertsPageSize"
                @update:sort="handleEspacesVertsSort"
                @openMapModal="handleOpenMapModal"
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
                :search="safeFontainesFilters.search"
                :selected-types="safeFontainesFilters.types"
                :selected-arrondissements="safeFontainesFilters.arrondissements"
                :selected-etats="safeFontainesFilters.etats"
                :type-options="safeFontainesFilterOptions.types"
                :arrondissement-options="safeFontainesFilterOptions.arrondissements"
                :etat-options="safeFontainesFilterOptions.etats"
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
              :rows="fontainesStore.pagination?.pageSize || 20"
              :columns="fontainesColumns.length"
            >
              <DataTable
                :data="fontainesStore.currentPageData || []"
                :loading="fontainesStore.loading"
                :pagination="fontainesStore.pagination"
                :sort-by="fontainesStore.sortBy"
                :sort-order="fontainesStore.sortOrder"
                :columns="fontainesColumns"
                :get-cell-value="getFontaineCellValue"
                @update:page="handleFontainesPage"
                @update:page-size="handleFontainesPageSize"
                @update:sort="handleFontainesSort"
                @openMapModal="handleOpenMapModal"
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
      @update:filters="handleMapFiltersUpdate"
      @update:map-filters="handleMapFiltersUpdate"
    />
  </div>
</template>
