import type { SelectOption } from '~/types/datasets'

export function generateAccessibiliteOptions(data: any[]): SelectOption[] {
  const accessibiliteMap = new Map<string, number>()
  
  data.forEach(item => {
    if (item.ouvert_24h === 'Oui') {
      accessibiliteMap.set('Ouvert 24h/24', (accessibiliteMap.get('Ouvert 24h/24') || 0) + 1)
    }
    
    if (item.canicule_ouverture === 'Oui') {
      accessibiliteMap.set('Ouverture canicule', (accessibiliteMap.get('Ouverture canicule') || 0) + 1)
    }
    
    if (item.modele && (
      item.modele.toLowerCase().includes('pmr') || 
      item.modele.toLowerCase().includes('accessible') ||
      item.modele.toLowerCase().includes('handicap')
    )) {
      accessibiliteMap.set('Accessible PMR', (accessibiliteMap.get('Accessible PMR') || 0) + 1)
    }
  })

  return Array.from(accessibiliteMap.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count)
}

export function generateTarifOptions(data: any[]): SelectOption[] {
  const tarifMap = new Map<string, number>()
  
  data.forEach(item => {
    if (item.payant) {
      const tarif = item.payant.trim()
      if (tarif && tarif !== 'Non spécifié') {
        tarifMap.set(tarif, (tarifMap.get(tarif) || 0) + 1)
      }
    }
  })

  return Array.from(tarifMap.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count)
}

export function generateHoraireOptions(data: any[]): SelectOption[] {
  const horaireMap = new Map<string, number>()
  
  data.forEach(item => {
    if (item.ouvert_24h === 'Oui') {
      horaireMap.set('Ouvert 24h/24', (horaireMap.get('Ouvert 24h/24') || 0) + 1)
    }
    
    if (item.horaires) {
      const horaire = normalizeHoraire(item.horaires)
      if (horaire) {
        horaireMap.set(horaire, (horaireMap.get(horaire) || 0) + 1)
      }
    }
    
    if (item.canicule_ouverture === 'Oui') {
      horaireMap.set('Ouverture prolongée canicule', (horaireMap.get('Ouverture prolongée canicule') || 0) + 1)
    }
  })

  return Array.from(horaireMap.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count)
}

function normalizeHoraire(horaire: string): string | null {
  if (!horaire || horaire === 'Non spécifié' || horaire.trim() === '') {
    return null
  }

  const horaireStr = horaire.trim().toLowerCase()

  if (horaireStr.includes('24h') || horaireStr.includes('24/24')) {
    return 'Ouvert 24h/24'
  }
  
  if (horaireStr.includes('renseigner') || horaireStr.includes('variable')) {
    return 'Horaires variables'
  }
  
  if (horaireStr.includes('été') || horaireStr.includes('estival')) {
    return 'Horaires été'
  }
  
  if (horaireStr.includes('hiver')) {
    return 'Horaires hiver'
  }
  
  if (horaireStr.match(/\d+h\d*\s*-\s*\d+h\d*/)) {
    return 'Horaires fixes'
  }

  return 'Autres horaires'
}