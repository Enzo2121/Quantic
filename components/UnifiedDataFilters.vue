<script setup lang="ts">
import type { SelectOption, UnifiedFilters } from '~/types/datasets'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  filters: UnifiedFilters
  filterOptions: Record<string, SelectOption[]>
  isLoadingOptions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingOptions: false,
})

const emit = defineEmits<{
  'update:filters': [filters: Partial<UnifiedFilters>]
  'reset': []
}>()

const searchInput = ref(props.filters.search)
const isTypeOpen = ref(false)
const isCategorieOpen = ref(false)
const isArrondissementOpen = ref(false)
const isEtatOpen = ref(false)
const isTarifOpen = ref(false)
const isHoraireOpen = ref(false)

const debouncedUpdate = useDebounceFn((value: string) => {
  emit('update:filters', { search: value })
}, 300)

watch(searchInput, (newValue) => {
  debouncedUpdate(newValue)
})

watch(() => props.filters.search, (newValue) => {
  if (newValue !== searchInput.value) {
    searchInput.value = newValue
  }
})

// Fonctions pour gérer les sources de données
function toggleSource(source: 'equipements' | 'espaces-verts' | 'fontaines') {
  const newSources = props.filters.sources.includes(source)
    ? props.filters.sources.filter(s => s !== source)
    : [...props.filters.sources, source]
  
  emit('update:filters', { sources: newSources })
}

// Fonctions pour gérer les filtres multi-sélection
function toggleFilter(filterType: keyof UnifiedFilters, value: string) {
  const currentValues = props.filters[filterType] as string[]
  const newValues = currentValues.includes(value)
    ? currentValues.filter(v => v !== value)
    : [...currentValues, value]
  
  emit('update:filters', { [filterType]: newValues })
}

function clearFilter(filterType: keyof UnifiedFilters) {
  emit('update:filters', { [filterType]: [] })
}

function clearAllFilters() {
  searchInput.value = ''
  emit('reset')
}

// Computed pour les options disponibles selon les sources sélectionnées
const availableOptions = computed(() => {
  return {
    types: props.filterOptions.types || [],
    arrondissements: props.filterOptions.arrondissements || [],
    categories: props.filterOptions.categories || [],
    etats: props.filterOptions.etats || [],
    tarifs: props.filterOptions.tarifs || [],
    horaires: props.filterOptions.horaires || [],
  }
})

const showCategoriesFilter = computed(() => 
  props.filters.sources.includes('espaces-verts') && availableOptions.value.categories.length > 0
)

const showEtatsFilter = computed(() => 
  props.filters.sources.includes('fontaines') && availableOptions.value.etats.length > 0
)

const showTarifsFilter = computed(() => 
  props.filters.sources.includes('equipements') && availableOptions.value.tarifs.length > 0
)
</script>

<template>
  <div class="space-y-6">
    <!-- Sources de données -->
    <div class="space-y-2">
      <Label class="text-sm font-medium">Sources de données</Label>
      <div class="flex flex-wrap gap-2">
        <div class="flex items-center space-x-2">
          <Checkbox
            id="source-equipements"
            :checked="filters.sources.includes('equipements')"
            @update:checked="() => toggleSource('equipements')"
          />
          <Label for="source-equipements" class="text-sm cursor-pointer">
            <Icon name="i-lucide-dumbbell" class="mr-1 h-4 w-4 inline" />
            Équipements sportifs
          </Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="source-espaces"
            :checked="filters.sources.includes('espaces-verts')"
            @update:checked="() => toggleSource('espaces-verts')"
          />
          <Label for="source-espaces" class="text-sm cursor-pointer">
            <Icon name="i-lucide-leaf" class="mr-1 h-4 w-4 inline" />
            Espaces verts
          </Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="source-fontaines"
            :checked="filters.sources.includes('fontaines')"
            @update:checked="() => toggleSource('fontaines')"
          />
          <Label for="source-fontaines" class="text-sm cursor-pointer">
            <Icon name="i-lucide-droplets" class="mr-1 h-4 w-4 inline" />
            Fontaines à boire
          </Label>
        </div>
      </div>
    </div>

    <!-- Recherche -->
    <div class="space-y-2">
      <Label for="unified-search">Recherche globale</Label>
      <div class="relative">
        <Icon name="i-lucide-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="unified-search"
          v-model="searchInput"
          placeholder="Rechercher dans tous les datasets..."
          class="pl-9 pr-9"
        />
        <Button
          v-if="searchInput"
          variant="ghost"
          size="sm"
          class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          @click="searchInput = ''"
        >
          <Icon name="i-lucide-x" class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <!-- Filtres principaux -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Types -->
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          Types
          <Badge v-if="filters.types.length > 1" variant="secondary" class="text-xs">
            {{ filters.types.length }} sélectionnés
          </Badge>
        </Label>

        <Popover v-model:open="isTypeOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isTypeOpen"
              :disabled="isLoadingOptions"
              class="w-full justify-between"
            >
              <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </span>
              <span v-else-if="filters.types.length === 0" class="text-muted-foreground">
                Tous les types
              </span>
              <span v-else-if="filters.types.length === 1">
                {{ filters.types[0] }}
              </span>
              <span v-else class="font-medium">
                {{ filters.types.length }} types sélectionnés
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in availableOptions.types"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleFilter('types', option.value)"
                >
                  <Icon
                    :name="filters.types.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !filters.types.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="filters.types.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="type in filters.types"
            :key="type"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="toggleFilter('types', type)"
          >
            {{ type }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="filters.types.length > 1" variant="ghost" size="sm" @click="clearFilter('types')">
            Tout effacer
          </Button>
        </div>
      </div>

      <!-- Arrondissements -->
      <div class="space-y-2">
        <Label>Arrondissements</Label>

        <Popover v-model:open="isArrondissementOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isArrondissementOpen"
              :disabled="isLoadingOptions"
              class="w-full justify-between"
            >
              <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </span>
              <span v-else-if="filters.arrondissements.length === 0" class="text-muted-foreground">
                Tous les arrondissements
              </span>
              <span v-else-if="filters.arrondissements.length === 1">
                {{ filters.arrondissements[0] }}
              </span>
              <span v-else>
                {{ filters.arrondissements.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in availableOptions.arrondissements"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleFilter('arrondissements', option.value)"
                >
                  <Icon
                    :name="filters.arrondissements.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !filters.arrondissements.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="filters.arrondissements.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="arr in filters.arrondissements"
            :key="arr"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="toggleFilter('arrondissements', arr)"
          >
            {{ arr }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="filters.arrondissements.length > 1" variant="ghost" size="sm" @click="clearFilter('arrondissements')">
            Tout effacer
          </Button>
        </div>
      </div>
    </div>

    <!-- Filtres conditionnels -->
    <div v-if="showCategoriesFilter || showEtatsFilter || showTarifsFilter" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- Catégories (Espaces verts) -->
      <div v-if="showCategoriesFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          <Icon name="i-lucide-leaf" class="h-4 w-4" />
          Catégories
        </Label>

        <Popover v-model:open="isCategorieOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isCategorieOpen"
              class="w-full justify-between"
            >
              <span v-if="filters.categories.length === 0" class="text-muted-foreground">
                Toutes les catégories
              </span>
              <span v-else-if="filters.categories.length === 1">
                {{ filters.categories[0] }}
              </span>
              <span v-else>
                {{ filters.categories.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in availableOptions.categories"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleFilter('categories', option.value)"
                >
                  <Icon
                    :name="filters.categories.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !filters.categories.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="filters.categories.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="cat in filters.categories"
            :key="cat"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="toggleFilter('categories', cat)"
          >
            {{ cat }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
        </div>
      </div>

      <!-- États (Fontaines) -->
      <div v-if="showEtatsFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          <Icon name="i-lucide-droplets" class="h-4 w-4" />
          État
        </Label>

        <Popover v-model:open="isEtatOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isEtatOpen"
              class="w-full justify-between"
            >
              <span v-if="filters.etats.length === 0" class="text-muted-foreground">
                Tous les états
              </span>
              <span v-else-if="filters.etats.length === 1">
                {{ filters.etats[0] }}
              </span>
              <span v-else>
                {{ filters.etats.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in availableOptions.etats"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleFilter('etats', option.value)"
                >
                  <Icon
                    :name="filters.etats.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !filters.etats.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="filters.etats.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="etat in filters.etats"
            :key="etat"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="toggleFilter('etats', etat)"
          >
            {{ etat }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
        </div>
      </div>

      <!-- Tarifs (Équipements) -->
      <div v-if="showTarifsFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          <Icon name="i-lucide-euro" class="h-4 w-4" />
          Tarification
        </Label>

        <Popover v-model:open="isTarifOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isTarifOpen"
              class="w-full justify-between"
            >
              <span v-if="filters.tarifs.length === 0" class="text-muted-foreground">
                Tous les tarifs
              </span>
              <span v-else-if="filters.tarifs.length === 1">
                {{ filters.tarifs[0] }}
              </span>
              <span v-else>
                {{ filters.tarifs.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in availableOptions.tarifs"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleFilter('tarifs', option.value)"
                >
                  <Icon
                    :name="filters.tarifs.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !filters.tarifs.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="filters.tarifs.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="tarif in filters.tarifs"
            :key="tarif"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="toggleFilter('tarifs', tarif)"
          >
            {{ tarif }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col items-start gap-2">
      <Button class="w-full px-0" variant="outline" @click="clearAllFilters">
        <Icon name="i-lucide-trash-2" class="mr-2 h-4 w-4" />
        Supprimer tous les filtres
      </Button>
    </div>
  </div>
</template>