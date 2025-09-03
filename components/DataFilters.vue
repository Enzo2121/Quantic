<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import type { SelectOption } from '~/types/datasets'

interface Props {
  search: string
  selectedTypes: string[]
  selectedCategories?: string[]
  selectedArrondissements: string[]
  selectedEtats?: string[]
  typeOptions: SelectOption[]
  categorieOptions?: SelectOption[]
  arrondissementOptions: SelectOption[]
  etatOptions?: SelectOption[]
  showCategorieFilter?: boolean
  showEtatFilter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategories: () => [],
  selectedEtats: () => [],
  categorieOptions: () => [],
  etatOptions: () => [],
  showCategorieFilter: false,
  showEtatFilter: false
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:selectedTypes': [value: string[]]
  'update:selectedCategories': [value: string[]]
  'update:selectedArrondissements': [value: string[]]
  'update:selectedEtats': [value: string[]]
  'reset': []
}>()

const searchInput = ref('')
const isTypeOpen = ref(false)
const isCategorieOpen = ref(false)
const isArrondissementOpen = ref(false)
const isEtatOpen = ref(false)

const debouncedUpdate = useDebounceFn((value: string) => {
  emit('update:search', value)
}, 300)

watch(searchInput, (newValue) => {
  debouncedUpdate(newValue)
})

watch(() => props.search, (newValue) => {
  if (newValue !== searchInput.value) {
    searchInput.value = newValue
  }
})

function toggleTypeOption(value: string) {
  const newValue = props.selectedTypes.includes(value)
    ? props.selectedTypes.filter(v => v !== value)
    : [...props.selectedTypes, value]

  emit('update:selectedTypes', newValue)
}

function toggleArrondissementOption(value: string) {
  const newValue = props.selectedArrondissements.includes(value)
    ? props.selectedArrondissements.filter(v => v !== value)
    : [...props.selectedArrondissements, value]

  emit('update:selectedArrondissements', newValue)
}

function toggleCategorieOption(value: string) {
  const newValue = props.selectedCategories.includes(value)
    ? props.selectedCategories.filter(v => v !== value)
    : [...props.selectedCategories, value]

  emit('update:selectedCategories', newValue)
}

function toggleEtatOption(value: string) {
  const newValue = props.selectedEtats.includes(value)
    ? props.selectedEtats.filter(v => v !== value)
    : [...props.selectedEtats, value]

  emit('update:selectedEtats', newValue)
}

function removeTypeOption(value: string) {
  emit('update:selectedTypes', props.selectedTypes.filter(v => v !== value))
}

function removeArrondissementOption(value: string) {
  emit('update:selectedArrondissements', props.selectedArrondissements.filter(v => v !== value))
}

function removeCategorieOption(value: string) {
  emit('update:selectedCategories', props.selectedCategories.filter(v => v !== value))
}

function removeEtatOption(value: string) {
  emit('update:selectedEtats', props.selectedEtats.filter(v => v !== value))
}

function clearTypes() {
  emit('update:selectedTypes', [])
}

function clearArrondissements() {
  emit('update:selectedArrondissements', [])
}

function clearCategories() {
  emit('update:selectedCategories', [])
}

function clearEtats() {
  emit('update:selectedEtats', [])
}

function clearAll() {
  searchInput.value = ''
  emit('update:search', '')
  emit('update:selectedTypes', [])
  emit('update:selectedCategories', [])
  emit('update:selectedArrondissements', [])
  emit('update:selectedEtats', [])
}
</script>

<template>
  <div class="space-y-6">
    <!-- Barre de recherche -->
    <div class="space-y-2">
      <Label for="search">Rechercher</Label>
      <div class="relative">
        <Icon name="i-lucide-search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          v-model="searchInput"
          placeholder="Rechercher par nom, adresse..."
          class="pl-9 pr-9"
        />
        <Button
          v-if="searchInput"
          variant="ghost"
          size="sm"
          class="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          @click="searchInput = ''"
        >
          <Icon name="i-lucide-x" class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <!-- Filtres multiples -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Filtre par type -->
      <div class="space-y-2">
        <Label>Type</Label>

        <!-- Selected chips -->
        <div v-if="selectedTypes.length > 0" class="flex flex-wrap gap-1 mb-2">
          <Badge
            v-for="type in selectedTypes"
            :key="type"
            variant="secondary"
            class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            @click="removeTypeOption(type)"
          >
            {{ type }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedTypes.length > 1" variant="ghost" size="sm" @click="clearTypes">
            Tout effacer
          </Button>
        </div>

        <!-- Select -->
        <Popover v-model:open="isTypeOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isTypeOpen"
              class="w-full justify-between"
            >
              <span v-if="selectedTypes.length === 0" class="text-muted-foreground">
                Sélectionner un type...
              </span>
              <span v-else-if="selectedTypes.length === 1">
                {{ selectedTypes[0] }}
              </span>
              <span v-else>
                {{ selectedTypes.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un type..." />
              <CommandEmpty>Aucun type trouvé.</CommandEmpty>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleTypeOption(option.value)"
                >
                  <Icon
                    :name="selectedTypes.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedTypes.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">
                    ({{ option.count }})
                  </span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Filtre par categorie -->
      <div v-if="showCategorieFilter" class="space-y-2">
        <Label>Catégorie</Label>

        <!-- Selected chips -->
        <div v-if="selectedCategories.length > 0" class="flex flex-wrap gap-1 mb-2">
          <Badge
            v-for="categorie in selectedCategories"
            :key="categorie"
            variant="secondary"
            class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            @click="removeCategorieOption(categorie)"
          >
            {{ categorie }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedCategories.length > 1" variant="ghost" size="sm" @click="clearCategories">
            Tout effacer
          </Button>
        </div>

        <!-- Select -->
        <Popover v-model:open="isCategorieOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isCategorieOpen"
              class="w-full justify-between"
            >
              <span v-if="selectedCategories.length === 0" class="text-muted-foreground">
                Sélectionner une catégorie...
              </span>
              <span v-else-if="selectedCategories.length === 1">
                {{ selectedCategories[0] }}
              </span>
              <span v-else>
                {{ selectedCategories.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher une catégorie..." />
              <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in categorieOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleCategorieOption(option.value)"
                >
                  <Icon
                    :name="selectedCategories.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedCategories.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">
                    ({{ option.count }})
                  </span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Filtre par arrondissement -->
      <div class="space-y-2">
        <Label>Arrondissement</Label>

        <!-- Selected chips -->
        <div v-if="selectedArrondissements.length > 0" class="flex flex-wrap gap-1 mb-2">
          <Badge
            v-for="arr in selectedArrondissements"
            :key="arr"
            variant="secondary"
            class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            @click="removeArrondissementOption(arr)"
          >
            {{ arr }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedArrondissements.length > 1" variant="ghost" size="sm" @click="clearArrondissements">
            Tout effacer
          </Button>
        </div>

        <!-- Select -->
        <Popover v-model:open="isArrondissementOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isArrondissementOpen"
              class="w-full justify-between"
            >
              <span v-if="selectedArrondissements.length === 0" class="text-muted-foreground">
                Sélectionner un arrondissement...
              </span>
              <span v-else-if="selectedArrondissements.length === 1">
                {{ selectedArrondissements[0] }}
              </span>
              <span v-else>
                {{ selectedArrondissements.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un arrondissement..." />
              <CommandEmpty>Aucun arrondissement trouvé.</CommandEmpty>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in arrondissementOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleArrondissementOption(option.value)"
                >
                  <Icon
                    :name="selectedArrondissements.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedArrondissements.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">
                    ({{ option.count }})
                  </span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Filtre par état (optionnel) -->
      <div v-if="showEtatFilter" class="space-y-2">
        <Label>État</Label>

        <!-- Selected chips -->
        <div v-if="selectedEtats.length > 0" class="flex flex-wrap gap-1 mb-2">
          <Badge
            v-for="etat in selectedEtats"
            :key="etat"
            variant="secondary"
            class="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            @click="removeEtatOption(etat)"
          >
            {{ etat }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedEtats.length > 1" variant="ghost" size="sm" @click="clearEtats">
            Tout effacer
          </Button>
        </div>

        <!-- Select -->
        <Popover v-model:open="isEtatOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isEtatOpen"
              class="w-full justify-between"
            >
              <span v-if="selectedEtats.length === 0" class="text-muted-foreground">
                Sélectionner un état...
              </span>
              <span v-else-if="selectedEtats.length === 1">
                {{ selectedEtats[0] }}
              </span>
              <span v-else>
                {{ selectedEtats.length }} sélectionné(s)
              </span>
              <Icon name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un état..." />
              <CommandEmpty>Aucun état trouvé.</CommandEmpty>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in etatOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleEtatOption(option.value)"
                >
                  <Icon
                    :name="selectedEtats.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedEtats.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">
                    ({{ option.count }})
                  </span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- Bouton de réinitialisation -->
    <div class="flex justify-end">
      <Button variant="outline" @click="clearAll">
        <Icon name="i-lucide-rotate-ccw" class="mr-2 h-4 w-4" />
        Réinitialiser les filtres
      </Button>
    </div>
  </div>
</template>
