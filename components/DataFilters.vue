<script setup lang="ts">
import type { SelectOption } from '~/types/datasets'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Props {
  search: string
  selectedTypes: string[]
  selectedCategories?: string[]
  selectedArrondissements: string[]
  selectedEtats?: string[]
  selectedTarifs?: string[]
  selectedHoraires?: string[]
  typeOptions: SelectOption[]
  categorieOptions?: SelectOption[]
  arrondissementOptions: SelectOption[]
  etatOptions?: SelectOption[]
  tarifOptions?: SelectOption[]
  horaireOptions?: SelectOption[]
  showCategorieFilter?: boolean
  showEtatFilter?: boolean
  showTarifFilter?: boolean
  showHoraireFilter?: boolean
  isLoadingOptions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategories: () => [],
  selectedEtats: () => [],
  selectedTarifs: () => [],
  selectedHoraires: () => [],
  categorieOptions: () => [],
  etatOptions: () => [],
  tarifOptions: () => [],
  horaireOptions: () => [],
  showCategorieFilter: false,
  showEtatFilter: false,
  showTarifFilter: false,
  showHoraireFilter: false,
  isLoadingOptions: false,
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:selectedTypes': [value: string[]]
  'update:selectedCategories': [value: string[]]
  'update:selectedArrondissements': [value: string[]]
  'update:selectedEtats': [value: string[]]
  'update:selectedTarifs': [value: string[]]
  'update:selectedHoraires': [value: string[]]
  'reset': []
}>()

const searchInput = ref('')
const isTypeOpen = ref(false)
const isCategorieOpen = ref(false)
const isArrondissementOpen = ref(false)
const isEtatOpen = ref(false)
const isTarifOpen = ref(false)
const isHoraireOpen = ref(false)

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

function toggleTarifOption(value: string) {
  const newValue = props.selectedTarifs.includes(value)
    ? props.selectedTarifs.filter(v => v !== value)
    : [...props.selectedTarifs, value]

  emit('update:selectedTarifs', newValue)
}

function toggleHoraireOption(value: string) {
  const newValue = props.selectedHoraires.includes(value)
    ? props.selectedHoraires.filter(v => v !== value)
    : [...props.selectedHoraires, value]

  emit('update:selectedHoraires', newValue)
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

function removeTarifOption(value: string) {
  emit('update:selectedTarifs', props.selectedTarifs.filter(v => v !== value))
}

function removeHoraireOption(value: string) {
  emit('update:selectedHoraires', props.selectedHoraires.filter(v => v !== value))
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

function clearTarifs() {
  emit('update:selectedTarifs', [])
}

function clearHoraires() {
  emit('update:selectedHoraires', [])
}

function clearAll() {
  searchInput.value = ''
  emit('update:search', '')
  emit('update:selectedTypes', [])
  emit('update:selectedCategories', [])
  emit('update:selectedArrondissements', [])
  emit('update:selectedEtats', [])
  emit('update:selectedTarifs', [])
  emit('update:selectedHoraires', [])
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <Label for="search">Rechercher</Label>
      <div class="relative">
        <Icon name="i-lucide-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          @click="searchInput = ''"
        >
          <Icon name="i-lucide-x" class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          Type
          <Badge v-if="selectedTypes.length > 1" variant="secondary" class="text-xs">
            {{ selectedTypes.length }} sélectionnés
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
                Chargement des options...
              </span>
              <span v-else-if="selectedTypes.length === 0" class="text-muted-foreground">
                Sélectionner un type...
              </span>
              <span v-else-if="selectedTypes.length === 1">
                {{ selectedTypes[0] }}
              </span>
              <span v-else class="font-medium">
                {{ selectedTypes.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
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
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="selectedTypes.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="type in selectedTypes"
            :key="type"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="removeTypeOption(type)"
          >
            {{ type }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedTypes.length > 1" variant="ghost" size="sm" @click="clearTypes">
            Tout effacer
          </Button>
        </div>
      </div>

      <div v-if="showCategorieFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          Catégorie
          <Badge v-if="selectedCategories.length > 1" variant="secondary" class="text-xs">
            {{ selectedCategories.length }} sélectionnées
          </Badge>
        </Label>

        <Popover v-model:open="isCategorieOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isCategorieOpen"
              :disabled="isLoadingOptions"
              class="w-full justify-between"
            >
              <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Chargement des options...
              </span>
              <span v-else-if="selectedCategories.length === 0" class="text-muted-foreground">
                Sélectionner une catégorie...
              </span>
              <span v-else-if="selectedCategories.length === 1">
                {{ selectedCategories[0] }}
              </span>
              <span v-else class="font-medium">
                {{ selectedCategories.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
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
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="selectedCategories.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="categorie in selectedCategories"
            :key="categorie"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="removeCategorieOption(categorie)"
          >
            {{ categorie }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedCategories.length > 1" variant="ghost" size="sm" @click="clearCategories">
            Tout effacer
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label>Arrondissement</Label>

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
                Chargement des options...
              </span>
              <span v-else-if="selectedArrondissements.length === 0" class="text-muted-foreground">
                Sélectionner un arrondissement...
              </span>
              <span v-else-if="selectedArrondissements.length === 1">
                {{ selectedArrondissements[0] }}
              </span>
              <span v-else>
                {{ selectedArrondissements.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
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
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="selectedArrondissements.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="arr in selectedArrondissements"
            :key="arr"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="removeArrondissementOption(arr)"
          >
            {{ arr }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedArrondissements.length > 1" variant="ghost" size="sm" @click="clearArrondissements">
            Tout effacer
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label v-if="showEtatFilter" class="flex items-center gap-2">
          État
          <Badge v-if="selectedEtats.length > 1" variant="secondary" class="text-xs">
            {{ selectedEtats.length }} sélectionnés
          </Badge>
        </Label>
        <Label v-else>&nbsp;</Label>

        <div v-if="showEtatFilter" class="space-y-2">
          <Popover v-model:open="isEtatOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="isEtatOpen"
                :disabled="isLoadingOptions"
                class="w-full justify-between"
              >
                <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                  <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  Chargement des options...
                </span>
                <span v-else-if="selectedEtats.length === 0" class="text-muted-foreground">
                  Sélectionner un état...
                </span>
                <span v-else-if="selectedEtats.length === 1">
                  {{ selectedEtats[0] }}
                </span>
                <span v-else class="font-medium">
                  {{ selectedEtats.length }} sélectionné(s)
                </span>
                <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent class="w-full p-0" align="start">
              <Command>
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
                    <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div v-if="selectedEtats.length > 0" class="flex flex-wrap gap-1">
            <Badge
              v-for="etat in selectedEtats"
              :key="etat"
              variant="secondary"
              class="cursor-pointer hover:bg-quantic hover:text-white"
              @click="removeEtatOption(etat)"
            >
              {{ etat }}
              <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
            </Badge>
            <Button v-if="selectedEtats.length > 1" variant="ghost" size="sm" @click="clearEtats">
              Tout effacer
            </Button>
          </div>
        </div>

        <div class="flex flex-col items-start gap-2" :class="{ 'mt-6': !showEtatFilter }">
          <Button class="w-full px-0" variant="outline" @click="clearAll">
            <Icon name="i-lucide-trash-2" class="mr-2 h-4 w-4" />
            Supprimer les filtres
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-if="showTarifFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          <Icon name="i-lucide-euro" class="h-4 w-4" />
          Tarification
          <Badge v-if="selectedTarifs.length > 1" variant="secondary" class="text-xs">
            {{ selectedTarifs.length }} sélectionnés
          </Badge>
        </Label>

        <Popover v-model:open="isTarifOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isTarifOpen"
              :disabled="isLoadingOptions"
              class="w-full justify-between"
            >
              <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </span>
              <span v-else-if="selectedTarifs.length === 0" class="text-muted-foreground">
                Sélectionner tarification...
              </span>
              <span v-else-if="selectedTarifs.length === 1">
                {{ selectedTarifs[0] }}
              </span>
              <span v-else class="font-medium">
                {{ selectedTarifs.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in tarifOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleTarifOption(option.value)"
                >
                  <Icon
                    :name="selectedTarifs.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedTarifs.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="selectedTarifs.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="tarif in selectedTarifs"
            :key="tarif"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="removeTarifOption(tarif)"
          >
            {{ tarif }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedTarifs.length > 1" variant="ghost" size="sm" @click="clearTarifs">
            Tout effacer
          </Button>
        </div>
      </div>

      <div v-if="showHoraireFilter" class="space-y-2">
        <Label class="flex items-center gap-2">
          <Icon name="i-lucide-clock" class="h-4 w-4" />
          Horaires d'ouverture
          <Badge v-if="selectedHoraires.length > 1" variant="secondary" class="text-xs">
            {{ selectedHoraires.length }} sélectionnés
          </Badge>
        </Label>

        <Popover v-model:open="isHoraireOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="isHoraireOpen"
              :disabled="isLoadingOptions"
              class="w-full justify-between"
            >
              <span v-if="isLoadingOptions" class="flex items-center text-muted-foreground">
                <Icon name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </span>
              <span v-else-if="selectedHoraires.length === 0" class="text-muted-foreground">
                Sélectionner horaires...
              </span>
              <span v-else-if="selectedHoraires.length === 1">
                {{ selectedHoraires[0] }}
              </span>
              <span v-else class="font-medium">
                {{ selectedHoraires.length }} sélectionné(s)
              </span>
              <Icon v-if="!isLoadingOptions" name="i-lucide-chevrons-up-down" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-full p-0" align="start">
            <Command>
              <CommandGroup class="max-h-48 overflow-auto">
                <CommandItem
                  v-for="option in horaireOptions"
                  :key="option.value"
                  :value="option.value"
                  @select="toggleHoraireOption(option.value)"
                >
                  <Icon
                    :name="selectedHoraires.includes(option.value) ? 'i-lucide-check' : 'i-lucide-circle'"
                    class="mr-2 h-4 w-4"
                    :class="{ 'opacity-0': !selectedHoraires.includes(option.value) }"
                  />
                  <span>{{ option.label }}</span>
                  <span v-if="option.count" class="ml-auto text-xs text-muted-foreground">({{ option.count }})</span>
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div v-if="selectedHoraires.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="horaire in selectedHoraires"
            :key="horaire"
            variant="secondary"
            class="cursor-pointer hover:bg-quantic hover:text-white"
            @click="removeHoraireOption(horaire)"
          >
            {{ horaire }}
            <Icon name="i-lucide-x" class="ml-1 h-3 w-3" />
          </Badge>
          <Button v-if="selectedHoraires.length > 1" variant="ghost" size="sm" @click="clearHoraires">
            Tout effacer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
