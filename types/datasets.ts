// Types pour dataset Ilots de fraîcheur - Équipements/Activités (API v1.0)
export interface EquipementSportifRecord {
  recordid: string
  datasetid: string
  fields: {
    nom: string
    type: string
    adresse: string
    arrondissement: string
    payant?: string
    horaires_periode?: string
  }
  geometry?: {
    type: 'Point'
    coordinates: [number, number]
  }
  record_timestamp: string
}

export interface EquipementSportifItem {
  id: string
  nom: string
  type: string
  adresse: string
  arrondissement: string
  latitude?: number
  longitude?: number
  payant?: string
  horaires?: string
}

export interface EquipementSportifFilters {
  search: string
  types: string[]
  arrondissements: string[]
}

export interface EquipementSportifState {
  data: EquipementSportifItem[]
  filteredData: EquipementSportifItem[]
  filters: EquipementSportifFilters
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  isLoaded: boolean
  cache: Map<number, EquipementSportifItem[]>
}

export interface EspaceVertRecord {
  recordid: string
  datasetid: string
  fields: {
    nom: string
    type: string
    adresse: string
    arrondissement: string
    categorie?: string
    superficie?: number
    ouvert_24h?: string
    ouverture?: string
    fermeture?: string
    canicule_ouverture?: string
  }
  geometry?: {
    type: 'Point'
    coordinates: [number, number]
  }
  record_timestamp: string
}

export interface EspaceVertItem {
  id: string
  nom: string
  type: string
  categorie?: string
  adresse: string
  arrondissement: string
  superficie?: number
  ouvert_24h?: string
  latitude?: number
  longitude?: number
  ouverture?: string
  fermeture?: string
  canicule_ouverture?: string
}

export interface EspaceVertFilters {
  search: string
  types: string[]
  categories: string[]
  arrondissements: string[]
}

export interface EspaceVertState {
  data: EspaceVertItem[]
  filteredData: EspaceVertItem[]
  filters: EspaceVertFilters
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  isLoaded: boolean
  cache: Map<number, EspaceVertItem[]>
}

export interface FontaineRecord {
  recordid: string
  datasetid: string
  fields: {
    gid: string
    voie: string
    type_objet: string
    commune: string
    dispo: string
    modele?: string
    no_voirie_pair?: string
    no_voirie_impair?: string
  }
  geometry?: {
    type: 'Point'
    coordinates: [number, number]
  }
  record_timestamp: string
}

export interface FontaineItem {
  id: string
  nom: string
  type: string
  adresse: string
  arrondissement: string
  etat: string
  latitude?: number
  longitude?: number
  modele?: string
}

export interface FontaineFilters {
  search: string
  types: string[]
  arrondissements: string[]
  etats: string[]
}

export interface FontaineState {
  data: FontaineItem[]
  filteredData: FontaineItem[]
  filters: FontaineFilters
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  isLoaded: boolean
  cache: Map<number, FontaineItem[]>
}

export interface SelectOption {
  value: string
  label: string
  count?: number
}

export interface FilterOptions {
  types?: SelectOption[]
  arrondissements?: SelectOption[]
  etats?: SelectOption[]
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface SortState {
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
}

export interface DatasetStoreState {
  data: any[]
  filteredData: any[]
  filters: Record<string, any>
  loading: boolean
  error: string | null
  pagination: PaginationState
  sort: SortState
  filterOptions: FilterOptions
}
