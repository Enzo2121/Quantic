import { createUnifiedApiHandler } from '../utils/unified-api-generator'
import { formatArrondissement, convertDisplayToApiFormat, buildApiParams } from '../utils/api-utils'
import type { ApiRecord, ApiResponse } from '../utils/api-utils'

interface EquipementRecord extends ApiRecord {
  fields: {
    nom: string
    type: string
    adresse: string
    arrondissement: string
    payant: string
    horaires_periode: string
    geo_point_2d?: [number, number]
  }
}

interface EquipementResult {
  id: string
  nom: string
  type: string
  adresse: string
  arrondissement: string
  latitude?: number
  longitude?: number
  payant: string
  horaires: string
}

async function fetchEquipementsForType(
  type: string,
  search: string,
  otherFilters: Record<string, string[]>,
  pageSize: number
): Promise<ApiResponse<EquipementRecord>> {
  const params = buildApiParams(
    {
      name: 'equipements-sportifs',
      endpoint: 'ilots-de-fraicheur-equipements-activites',
      facets: ['type', 'payant', 'arrondissement', 'horaires_periode']
    },
    {
      search,
      pageSize,
      start: 0,
      refines: {
        type: [type],
        arrondissement: otherFilters.arrondissements?.map(arr => 
          convertDisplayToApiFormat(arr, 'paris')
        ) || []
      }
    }
  )

  return await $fetch(`https://opendata.paris.fr/api/records/1.0/search/?${params}`)
}

export default createUnifiedApiHandler<EquipementRecord, EquipementResult>({
  name: 'equipements-sportifs',
  baseUrl: 'https://opendata.paris.fr/api/records/1.0/search/',
  dataset: {
    name: 'equipements-sportifs',
    endpoint: 'ilots-de-fraicheur-equipements-activites',
    facets: ['type', 'payant', 'arrondissement', 'horaires_periode']
  },
  transformer: {
    transform: (record: EquipementRecord): EquipementResult => ({
      id: record.recordid,
      nom: record.fields.nom || 'Nom non disponible',
      type: record.fields.type || 'Type non défini',
      adresse: record.fields.adresse || 'Adresse non disponible',
      arrondissement: formatArrondissement(record.fields.arrondissement, 'paris'),
      latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
      longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
      payant: record.fields.payant || 'Non spécifié',
      horaires: record.fields.horaires_periode,
    })
  },
  fetcher: {
    fetchForType: fetchEquipementsForType
  }
})
