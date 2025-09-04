<script setup lang="ts" generic="T extends Record<string, any>">
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Props {
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  sortBy?: string | null
  sortOrder?: 'asc' | 'desc'
  columns: string[]
  getCellValue?: (item: T, column: string) => any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortBy: null,
  sortOrder: 'asc'
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'update:sort': [sortBy: string, sortOrder: 'asc' | 'desc']
  'open-map-modal': [item: T]
}>()

function handleSort(column: string) {
  const newOrder = props.sortBy === column && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('update:sort', column, newOrder)
}

function getSortIcon(column: string) {
  if (props.sortBy !== column) return 'i-lucide-chevrons-up-down'
  return props.sortOrder === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
}

function viewDetails(item: T) {
  console.log('Voir détails:', item)
  // Ouvrir la modal de carte avec le point sélectionné
  emit('open-map-modal', item)
}


function openDirections(item: T) {
  console.log('Ouvrir itinéraire:', item)
  // Ouvrir Google Maps avec l'itinéraire vers le lieu
  const lat = (item as any).latitude
  const lng = (item as any).longitude
  const address = (item as any).adresse || (item as any).nom

  if (lat && lng) {
    // Utiliser les coordonnées pour l'itinéraire
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  } else if (address) {
    // Utiliser l'adresse pour l'itinéraire
    const encodedAddress = encodeURIComponent(`${address}, Paris, France`)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
    window.open(url, '_blank')
  }
}

const pageSizeOptions = [10, 20, 50, 100]
</script>

<template>
  <div class="space-y-4">
    <!-- Tableau -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="column in columns" :key="column">
              <Button
                variant="ghost"
                @click="handleSort(column)"
                class="h-8 px-2 lg:px-3 font-medium justify-start"
              >
                {{ column.charAt(0).toUpperCase() + column.slice(1) }}
                <Icon :name="getSortIcon(column)" class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead class="w-[100px]">Actions</TableHead>
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
          <template v-else-if="data.length">
            <TableRow v-for="item in data" :key="item.id || Math.random()">
              <TableCell v-for="column in columns" :key="column">
                <div v-if="getCellValue" class="font-medium">
                  <span v-if="column === 'horaires' || column === 'ouvert_24h' || column === 'canicule_ouverture'" v-html="getCellValue(item, column) || '-'"></span>
                  <span v-else>{{ getCellValue(item, column) || '-' }}</span>
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
                    @click="viewDetails(item)"
                    title="Voir sur la carte"
                  >
                    <Icon name="i-lucide-eye" class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="openDirections(item)"
                    title="Obtenir l'itinéraire"
                  >
                    <Icon name="i-lucide-map-pin" class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length + 1">
              <div class="text-center py-8">
                <Icon name="i-lucide-search-x" class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p class="text-lg font-medium">Aucun résultat trouvé</p>
                <p class="text-muted-foreground">Essayez de modifier vos filtres</p>
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
