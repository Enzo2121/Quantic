import { createUnifiedApiHandler } from '../utils/unified-api-generator'
import { formatArrondissement, convertDisplayToApiFormat, buildApiParams } from '../utils/api-utils'
import type { ApiRecord, ApiResponse } from '../utils/api-utils'

// === TYPES SPECIFIQUES ===
interface FontaineRecord extends ApiRecord {
  fields: {
    voie: string
    type_objet: string
    commune: string
    dispo: string
    no_voirie_pair?: string
    no_voirie_impair?: string
    modele: string
    geo_point_2d?: [number, number]
  }
}

interface FontaineResult {
  id: string
  nom: string
  type: string
  adresse: string
  arrondissement: string
  etat: string
  latitude?: number
  longitude?: number
  modele: string
}

// === FETCHERS SPECIFIQUES ===
async function fetchFontainesForType(
  type: string,
  search: string,
  otherFilters: Record<string, string[]>,
  pageSize: number
): Promise<ApiResponse<FontaineRecord>> {
  const params = buildApiParams(
    {
      name: 'fontaines',
      endpoint: 'fontaines-a-boire',
      facets: ['type_objet', 'dispo', 'commune']
    },
    {
      search,
      pageSize,
      start: 0,
      refines: {
        type_objet: [type],
        dispo: otherFilters.etats || [],
        commune: otherFilters.arrondissements?.map(arr => {
          const formatted = convertDisplayToApiFormat(arr, 'fontaine')
          return `PARIS ${formatted} ARRONDISSEMENT`
        }) || []
      }
    }
  )

  return await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)
}

async function fetchFontainesForEtat(
  etat: string,
  search: string,
  otherFilters: Record<string, string[]>,
  pageSize: number
): Promise<ApiResponse<FontaineRecord>> {
  const params = buildApiParams(
    {
      name: 'fontaines',
      endpoint: 'fontaines-a-boire',
      facets: ['type_objet', 'dispo', 'commune']
    },
    {
      search,
      pageSize,
      start: 0,
      refines: {
        dispo: [etat],
        type_objet: otherFilters.types || [],
        commune: otherFilters.arrondissements?.map(arr => {
          const formatted = convertDisplayToApiFormat(arr, 'fontaine')
          return `PARIS ${formatted} ARRONDISSEMENT`
        }) || []
      }
    }
  )

  return await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)
}

// === CONFIGURATION UNIFIEE ===
export default createUnifiedApiHandler<FontaineRecord, FontaineResult>({
  name: 'fontaines',
  baseUrl: 'https://parisdata.opendatasoft.com/api/records/1.0/search/',
  dataset: {
    name: 'fontaines',
    endpoint: 'fontaines-a-boire',
    facets: ['type_objet', 'dispo', 'commune']
  },
  transformer: {
    transform: (record: FontaineRecord): FontaineResult => ({
      id: record.recordid,
      nom: `Fontaine ${record.fields.voie || 'sans nom'}`,
      type: record.fields.type_objet || 'Type non défini',
      adresse: `${record.fields.no_voirie_pair || record.fields.no_voirie_impair || ''} ${record.fields.voie || ''}`.trim(),
      arrondissement: formatArrondissement(record.fields.commune, 'fontaine'),
      etat: record.fields.dispo || 'État non défini',
      latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
      longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
      modele: record.fields.modele
    })
  },
  fetcher: {
    fetchForType: fetchFontainesForType,
    fetchForEtat: fetchFontainesForEtat
  }
})
