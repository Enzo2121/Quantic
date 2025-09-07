<script setup lang="ts" generic="T extends Record<string, any>">
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'update:sort': [sortBy: string, sortOrder: 'asc' | 'desc']
  'openMapModal': [item: T]
}>()

const props = withDefaults(defineProps<{
  items?: any[]
  columns: string[]
  type?: 'equipements' | 'espaces-verts' | 'fontaines'
  loading?: boolean
  data?: any[]
  pagination?: {
    page: number
    pageSize: number
    total: number
  } | null
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
  getCellValue?: (item: any, column: string) => any
}>(), {
  items: () => [],
  loading: false,
  data: () => [],
  pagination: null,
  sortBy: null,
  sortOrder: 'asc',
  type: 'equipements',
  getCellValue: undefined,
})

const {
  getEquipementCellValue,
  getEspaceVertCellValue,
  getFontaineCellValue,
} = useDashboardUtils()

function getCellValueInternal(item: any, column: string) {
  if (props.getCellValue) {
    return props.getCellValue(item, column)
  }
  
  switch (props.type) {
    case 'equipements':
      return getEquipementCellValue(item, column)
    case 'espaces-verts':
      return getEspaceVertCellValue(item, column)
    case 'fontaines':
      return getFontaineCellValue(item, column)
    default:
      return item[column] || '-'
  }
}

function handleViewDetails(item: any) {
  console.log('Opening map modal for item:', item) // Debug
  emit('openMapModal', item)
}

function handleOpenItinerary(item: any) {
  if (item.latitude && item.longitude) {
    // Ouvrir Google Maps avec l'itinéraire
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
    window.open(googleMapsUrl, '_blank')
  } else if (item.adresse) {
    // Fallback avec l'adresse si pas de coordonnées
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.adresse)}`
    window.open(googleMapsUrl, '_blank')
  } else {
    console.warn('Impossible d\'ouvrir l\'itinéraire : aucune coordonnée ou adresse disponible')
  }
}

function handleSort(column: string) {
  const newOrder = props.sortBy === column && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('update:sort', column, newOrder)
}

function getSortIcon(column: string) {
  if (props.sortBy !== column) {
    return 'i-lucide-chevrons-up-down'
  }
  return props.sortOrder === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
}

const pageSizeOptions = [10, 20, 50, 100]
</script>

<template>
  <div class="space-y-4">
    <!-- Tableau -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in columns" :key="column">
              <Button
                variant="ghost"
                class="h-8 justify-start px-2 font-medium lg:px-3"
                @click="handleSort(column)"
              >
                {{ column.charAt(0).toUpperCase() + column.slice(1) }}
                <Icon :name="getSortIcon(column)" class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead class="w-[100px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="i in pagination?.pageSize || 10" :key="i">
              <TableCell v-for="j in columns.length + 1" :key="j">
                <Skeleton class="h-4 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="data && data.length">
            <TableRow v-for="item in data" :key="item.id || Math.random()">
              <TableCell v-for="column in columns" :key="column">
                <div v-if="getCellValueInternal" class="font-medium">
                  <span v-if="column === 'horaires' || column === 'ouvert_24h' || column === 'canicule_ouverture'" v-html="getCellValueInternal(item, column) || '-'" />
                  <span v-else>{{ getCellValueInternal(item, column) || '-' }}</span>
                </div>
                <div v-else class="font-medium">
                  {{ item[column] || '-' }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Voir sur la carte"
                    @click="handleViewDetails(item)"
                  >
                    <Icon name="i-lucide-eye" class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Obtenir l'itinéraire"
                    @click="handleOpenItinerary(item)"
                  >
                    <Icon name="i-lucide-map-pin" class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length + 1">
              <div class="py-8 text-center">
                <Icon name="i-lucide-search-x" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p class="text-lg font-medium">
                  Aucun résultat trouvé
                </p>
                <p class="text-muted-foreground">
                  Essayez de modifier vos filtres
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-if="pagination && pagination.total > 0" class="flex items-center justify-between px-2">
      <div class="flex items-center space-x-2">
        <p class="text-sm text-muted-foreground">
          Lignes par page
        </p>
        <Select :model-value="String(pagination.pageSize)" @update:model-value="(value) => emit('update:pageSize', Number(value))">
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in pageSizeOptions" :key="size" :value="String(size)">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center space-x-2">
        <p class="text-sm text-muted-foreground">
          {{ ((pagination.page - 1) * pagination.pageSize) + 1 }}-{{ Math.min(pagination.page * pagination.pageSize, pagination.total) }}
          sur {{ pagination.total }}
        </p>

        <div class="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page <= 1"
            @click="emit('update:page', 1)"
          >
            <Icon name="i-lucide-chevrons-left" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page <= 1"
            @click="emit('update:page', pagination.page - 1)"
          >
            <Icon name="i-lucide-chevron-left" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)"
            @click="emit('update:page', pagination.page + 1)"
          >
            <Icon name="i-lucide-chevron-right" class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)"
            @click="emit('update:page', Math.ceil(pagination.total / pagination.pageSize))"
          >
            <Icon name="i-lucide-chevrons-right" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
