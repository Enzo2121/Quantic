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
  getFormattedValue,
} = useDashboardUtils()

function getCellValueInternal(item: any, column: string) {
  if (props.getCellValue) {
    return props.getCellValue(item, column)
  }
  
  const value = getFormattedValue(item, column, props.type)
  
  return value
}

function handleViewDetails(item: any) {
  emit('openMapModal', item)
}

function handleOpenItinerary(item: any) {
  if (item.latitude && item.longitude) {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
    window.open(googleMapsUrl, '_blank')
  }
  else if (item.adresse) {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.adresse)}`
    window.open(googleMapsUrl, '_blank')
  }
  else {
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

function getBadgeClasses(badgeConfig: any) {
  if (!badgeConfig?.variant) {
    return ''
  }
  
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium'
  
  switch (badgeConfig.variant) {
    case 'success':
      return `${baseClasses} text-green-600 bg-green-50 border border-green-200`
    case 'warning':
      return `${baseClasses} text-orange-600 bg-orange-50 border border-orange-200`
    case 'info':
      return `${baseClasses} text-blue-600 bg-blue-50 border border-blue-200`
    case 'muted':
      return `${baseClasses} text-gray-600 bg-gray-50 border border-gray-200`
    default:
      return `${baseClasses} text-gray-700 bg-gray-100 border border-gray-300`
  }
}
</script>

<template>
  <div class="space-y-4">
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
                <div class="font-medium">
                  <template v-if="getCellValueInternal">
                    <!-- Affichage des badges pour les colonnes avec BadgeConfig -->
                    <template v-if="typeof getCellValueInternal(item, column) === 'object' && getCellValueInternal(item, column)?.variant">
                      <span class="inline-flex items-center gap-1" :class="getBadgeClasses(getCellValueInternal(item, column))">
                        <Icon :name="getCellValueInternal(item, column).icon" class="h-4 w-4" />
                        {{ getCellValueInternal(item, column).label }}
                      </span>
                    </template>
                    <!-- Affichage normal pour les autres colonnes -->
                    <template v-else>
                      {{ getCellValueInternal(item, column) || '-' }}
                    </template>
                  </template>
                  <template v-else>
                    {{ item[column] || '-' }}
                  </template>
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
