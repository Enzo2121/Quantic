export function useDashboardUtils() {
  function formatHoraires(horaires: string | undefined): string {
    if (!horaires || horaires === 'Non spécifié' || horaires.trim() === '') {
      return 'Horaires non spécifiés'
    }

    const horairesStr = horaires.trim()

    if (horairesStr.includes('renseigner directement') ||
        horairesStr.includes('susceptibles d\'évoluer') ||
        horairesStr.includes('sur place')) {
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

  function renderHorairesBadge(horaires: string | undefined): string {
    const formattedHoraires = formatHoraires(horaires)

    if (formattedHoraires === 'Horaires non spécifiés') {
      return '<span class="text-muted-foreground italic">Non spécifié</span>'
    }

    if (formattedHoraires === 'Se renseigner sur place') {
      return '<span class="inline-flex items-center gap-1 text-orange-600"><i class="i-lucide-info w-4 h-4"></i>Sur place</span>'
    }

    if (formattedHoraires === 'Horaires variables') {
      return '<span class="inline-flex items-center gap-1 text-blue-600"><i class="i-lucide-clock w-4 h-4"></i>Variables</span>'
    }

    if (formattedHoraires === 'Ouvert 24h/24') {
      return '<span class="inline-flex items-center gap-1 text-green-600"><i class="i-lucide-clock-3 w-4 h-4"></i>24h/24</span>'
    }

    return `<span class="inline-flex items-center gap-1 text-gray-700"><i class="i-lucide-clock w-4 h-4"></i>${formattedHoraires}</span>`
  }

  function renderOuvert24hBadge(ouvert24h: string | undefined): string {
    if (!ouvert24h || ouvert24h === 'Non spécifié') {
      return '<span class="text-muted-foreground italic">Non spécifié</span>'
    }

    if (ouvert24h === 'Oui') {
      return '<span class="inline-flex items-center gap-1 text-green-600"><i class="i-lucide-clock-3 w-4 h-4"></i>24h/24</span>'
    }

    if (ouvert24h === 'Non') {
      return '<span class="inline-flex items-center gap-1 text-gray-600"><i class="i-lucide-clock-x w-4 h-4"></i>Horaires limités</span>'
    }

    return `<span class="text-gray-700">${ouvert24h}</span>`
  }

  function renderCaniculeBadge(canicule: string | undefined): string {
    if (!canicule || canicule === 'Non spécifié') {
      return '<span class="text-muted-foreground italic">Non spécifié</span>'
    }

    if (canicule === 'Oui') {
      return '<span class="inline-flex items-center gap-1 text-green-600"><i class="i-lucide-sun w-4 h-4"></i>Ouvert canicule</span>'
    }

    if (canicule === 'Non') {
      return '<span class="inline-flex items-center gap-1 text-orange-600"><i class="i-lucide-sun-dim w-4 h-4"></i>Fermé canicule</span>'
    }

    return `<span class="text-gray-700">${canicule}</span>`
  }

  function getEquipementCellValue(item: any, column: string) {
    switch (column) {
      case 'nom':
        return item.nom
      case 'type':
        return item.type
      case 'adresse':
        return item.adresse
      case 'arrondissement':
        return item.arrondissement
      case 'payant':
        return item.payant || 'Non spécifié'
      case 'horaires':
        return renderHorairesBadge(item.horaires)
      default:
        return item[column] || '-'
    }
  }

  function getEspaceVertCellValue(item: any, column: string) {
    switch (column) {
      case 'nom':
        return item.nom
      case 'type':
        return item.type
      case 'categorie':
        return item.categorie || '-'
      case 'adresse':
        return item.adresse
      case 'arrondissement':
        return item.arrondissement
      case 'superficie':
        return item.superficie ? `${item.superficie} m²` : '-'
      case 'ouvert_24h':
        return renderOuvert24hBadge(item.ouvert_24h)
      case 'canicule_ouverture':
        return renderCaniculeBadge(item.canicule_ouverture)
      default:
        return item[column] || '-'
    }
  }

  function getFontaineCellValue(item: any, column: string) {
    switch (column) {
      case 'nom':
        return item.nom || 'Fontaine'
      case 'type':
        return item.type
      case 'adresse':
        return item.adresse
      case 'arrondissement':
        return item.arrondissement
      case 'etat':
        return item.etat === 'OUI' ? 'Disponible' :
               item.etat === 'NON' ? 'Indisponible' : item.etat
      default:
        return item[column] || '-'
    }
  }

  const equipementsColumns = ['nom', 'type', 'adresse', 'arrondissement', 'payant', 'horaires']
  const espacesVertsColumns = ['nom', 'type', 'categorie', 'adresse', 'arrondissement', 'superficie', 'ouvert_24h', 'canicule_ouverture']
  const fontainesColumns = ['nom', 'type', 'adresse', 'arrondissement', 'etat']

  return {
    formatHoraires,
    renderHorairesBadge,
    renderOuvert24hBadge,
    renderCaniculeBadge,

    getEquipementCellValue,
    getEspaceVertCellValue,
    getFontaineCellValue,

    equipementsColumns,
    espacesVertsColumns,
    fontainesColumns,
  }
}

