import type {
  EquipementSportifItem,
  EspaceVertItem,
  FontaineItem,
} from '~/types/datasets'

export interface BadgeConfig {
  variant: 'success' | 'warning' | 'info' | 'muted' | 'default'
  icon: string
  label: string
  description?: string
}

export type DataItemType = EquipementSportifItem | EspaceVertItem | FontaineItem
export type DatasetType = 'equipements' | 'espaces-verts' | 'fontaines'

const BADGE_CONFIGS = {
  horaires: {
    'Horaires non spécifiés': {
      variant: 'muted' as const,
      icon: 'i-lucide-clock-x',
      label: 'Non spécifié',
    },
    'Se renseigner sur place': {
      variant: 'warning' as const,
      icon: 'i-lucide-info',
      label: 'Sur place',
    },
    'Horaires variables': {
      variant: 'info' as const,
      icon: 'i-lucide-clock',
      label: 'Variables',
    },
    'Ouvert 24h/24': {
      variant: 'success' as const,
      icon: 'i-lucide-clock-3',
      label: '24h/24',
    },
  },
  ouverture: {
    'Non spécifié': {
      variant: 'muted' as const,
      icon: 'i-lucide-clock-x',
      label: 'Non spécifié',
    },
    'Oui': {
      variant: 'success' as const,
      icon: 'i-lucide-clock-3',
      label: '24h/24',
    },
    'Non': {
      variant: 'default' as const,
      icon: 'i-lucide-clock-x',
      label: 'Horaires limités',
    },
  },
  canicule: {
    'Non spécifié': {
      variant: 'muted' as const,
      icon: 'i-lucide-sun-dim',
      label: 'Non spécifié',
    },
    'Oui': {
      variant: 'success' as const,
      icon: 'i-lucide-sun',
      label: 'Ouvert canicule',
    },
    'Non': {
      variant: 'warning' as const,
      icon: 'i-lucide-sun-dim',
      label: 'Fermé canicule',
    },
  },
  etat: {
    OUI: {
      variant: 'success' as const,
      icon: 'i-lucide-check-circle',
      label: 'Disponible',
    },
    NON: {
      variant: 'warning' as const,
      icon: 'i-lucide-x-circle',
      label: 'Indisponible',
    },
    Disponible: {
      variant: 'success' as const,
      icon: 'i-lucide-check-circle',
      label: 'Disponible',
    },
    Indisponible: {
      variant: 'warning' as const,
      icon: 'i-lucide-x-circle',
      label: 'Indisponible',
    },
  },
} as const

export function useDashboardUtils() {
  function formatHoraires(horaires: string | undefined): string {
    if (!horaires || horaires === 'Non spécifié' || horaires.trim() === '') {
      return 'Horaires non spécifiés'
    }

    const horairesStr = horaires.trim()

    if (horairesStr.includes('renseigner directement')
      || horairesStr.includes('susceptibles d\'évoluer')
      || horairesStr.includes('sur place')) {
      return 'Se renseigner sur place'
    }

    if (horairesStr.includes('Horaires d\'ouverture')) {
      return 'Horaires variables'
    }

    if (horairesStr.includes('24h') || horairesStr.includes('24/24')) {
      return 'Ouvert 24h/24'
    }

    return horairesStr
      .replace(/\s+/g, ' ')
      .replace(/(\d+)h(\d*)/g, '$1h$2')
      .replace(/(\d+)H(\d*)/g, '$1h$2')
      .replace(/(\d+):(\d+)/g, '$1h$2')
      .replace(/-/g, ' - ')
      .replace(/à/g, ' à ')
      .trim()
  }

  function normalizeOuvert24h(ouvert24h: string | undefined): string {
    if (!ouvert24h || ouvert24h === 'Non spécifié') {
      return 'Non spécifié'
    }
    return ouvert24h
  }

  function normalizeCanicule(canicule: string | undefined): string {
    if (!canicule || canicule === 'Non spécifié') {
      return 'Non spécifié'
    }
    return canicule
  }

  function normalizeEtat(etat: string | undefined): string {
    if (!etat) {
      return 'Non spécifié'
    }
    
    if (etat === 'OUI') {
      return 'Disponible'
    }
    if (etat === 'NON') {
      return 'Indisponible'
    }
    
    return etat
  }

  function getBadgeConfig(type: keyof typeof BADGE_CONFIGS, value: string): BadgeConfig {
    const configs = BADGE_CONFIGS[type]
    const config = configs[value as keyof typeof configs]
    
    if (!config) {
      return {
        variant: 'default',
        icon: 'i-lucide-help-circle',
        label: value || 'Inconnu',
      }
    }
    
    return config as BadgeConfig
  }

  function getHorairesBadgeConfig(horaires: string | undefined): BadgeConfig {
    const formattedHoraires = formatHoraires(horaires)
    return getBadgeConfig('horaires', formattedHoraires)
  }

  function getOuvert24hBadgeConfig(ouvert24h: string | undefined): BadgeConfig {
    const normalized = normalizeOuvert24h(ouvert24h)
    return getBadgeConfig('ouverture', normalized)
  }

  function getCaniculeBadgeConfig(canicule: string | undefined): BadgeConfig {
    const normalized = normalizeCanicule(canicule)
    return getBadgeConfig('canicule', normalized)
  }

  function getEtatBadgeConfig(etat: string | undefined): BadgeConfig {
    const normalized = normalizeEtat(etat)
    return getBadgeConfig('etat', normalized)
  }

  function getFormattedValue(
    item: DataItemType,
    column: string,
    datasetType: DatasetType,
  ): string | BadgeConfig {
    switch (datasetType) {
      case 'equipements':
        return getEquipementValue(item as EquipementSportifItem, column)
      case 'espaces-verts':
        return getEspaceVertValue(item as EspaceVertItem, column)
      case 'fontaines':
        return getFontaineValue(item as FontaineItem, column)
      default:
        return '-'
    }
  }

  function getEquipementValue(item: EquipementSportifItem, column: string): string | BadgeConfig {
    switch (column) {
      case 'nom':
        return item.nom || '-'
      case 'type':
        return item.type || '-'
      case 'adresse':
        return item.adresse || '-'
      case 'arrondissement':
        return item.arrondissement || '-'
      case 'payant':
        return item.payant || 'Non spécifié'
      case 'horaires':
        return getHorairesBadgeConfig(item.horaires)
      default:
        return (item as any)[column] || '-'
    }
  }

  function getEspaceVertValue(item: EspaceVertItem, column: string): string | BadgeConfig {
    switch (column) {
      case 'nom':
        return item.nom || '-'
      case 'type':
        return item.type || '-'
      case 'categorie':
        return item.categorie || '-'
      case 'adresse':
        return item.adresse || '-'
      case 'arrondissement':
        return item.arrondissement || '-'
      case 'superficie':
        return item.superficie ? `${item.superficie} m²` : '-'
      case 'ouvert_24h':
        return getOuvert24hBadgeConfig(item.ouvert_24h)
      case 'canicule_ouverture':
        return getCaniculeBadgeConfig(item.canicule_ouverture)
      default:
        return (item as any)[column] || '-'
    }
  }

  function getFontaineValue(item: FontaineItem, column: string): string | BadgeConfig {
    switch (column) {
      case 'nom':
        return item.nom || 'Fontaine'
      case 'type':
        return item.type || '-'
      case 'adresse':
        return item.adresse || '-'
      case 'arrondissement':
        return item.arrondissement || '-'
      case 'etat':
        return getEtatBadgeConfig(item.etat)
      default:
        return (item as any)[column] || '-'
    }
  }

  const columnConfigs = computed(() => ({
    equipements: ['nom', 'type', 'adresse', 'arrondissement', 'payant', 'horaires'] as const,
    espacesVerts: ['nom', 'type', 'categorie', 'adresse', 'arrondissement', 'superficie', 'ouvert_24h', 'canicule_ouverture'] as const,
    fontaines: ['nom', 'type', 'adresse', 'arrondissement', 'etat'] as const,
  }))

  return {
    formatHoraires,
    normalizeOuvert24h,
    normalizeCanicule,
    normalizeEtat,
    
    getBadgeConfig,
    getHorairesBadgeConfig,
    getOuvert24hBadgeConfig,
    getCaniculeBadgeConfig,
    getEtatBadgeConfig,
    
    getFormattedValue,
    getEquipementValue,
    getEspaceVertValue,
    getFontaineValue,

    columnConfigs: readonly(columnConfigs),
  }
}

