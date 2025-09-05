import { createUnifiedApiHandler } from '../utils/unified-api-generator'
import { formatArrondissement, convertDisplayToApiFormat, buildApiParams } from '../utils/api-utils'
import type { ApiRecord, ApiResponse } from '../utils/api-utils'

interface EspaceVertRecord extends ApiRecord {
  fields: {
    nom: string
    type: string
    categorie: string
    adresse: string
    arrondissement: string
    superficie: number
    ouvert_24h: string
    geo_point_2d?: [number, number]
    ouverture: string
    fermeture: string
    canicule_ouverture: string
  }
}

interface EspaceVertResult {
  id: string
  nom: string
  type: string
  categorie: string
  adresse: string
  arrondissement: string
  superficie: number
  ouvert_24h: string
  latitude?: number
  longitude?: number
  ouverture: string
  fermeture: string
  canicule_ouverture: string
}

async function fetchEspacesVertsForType(
  type: string,
  search: string,
  otherFilters: Record<string, string[]>,
  pageSize: number
): Promise<ApiResponse<EspaceVertRecord>> {
  const params = buildApiParams(
    {
      name: 'espaces-verts',
      endpoint: 'ilots-de-fraicheur-espaces-verts-frais',
      facets: ['type', 'arrondissement']
    },
    {
      search,
      pageSize,
      start: 0,
      refines: {
        type: [type],
        categorie: otherFilters.categories || [],
        arrondissement: otherFilters.arrondissements?.map(arr => 
          convertDisplayToApiFormat(arr, 'paris')
        ) || []
      }
    }
  )

  return await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)
}

async function fetchEspacesVertsForCategory(
  category: string,
  search: string,
  otherFilters: Record<string, string[]>,
  pageSize: number
): Promise<ApiResponse<EspaceVertRecord>> {
  const params = buildApiParams(
    {
      name: 'espaces-verts',
      endpoint: 'ilots-de-fraicheur-espaces-verts-frais',
      facets: ['type', 'arrondissement']
    },
    {
      search,
      pageSize,
      start: 0,
      refines: {
        categorie: [category],
        type: otherFilters.types || [],
        arrondissement: otherFilters.arrondissements?.map(arr => 
          convertDisplayToApiFormat(arr, 'paris')
        ) || []
      }
    }
  )

  return await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)
}

export default createUnifiedApiHandler<EspaceVertRecord, EspaceVertResult>({
  name: 'espaces-verts',
  baseUrl: 'https://parisdata.opendatasoft.com/api/records/1.0/search/',
  dataset: {
    name: 'espaces-verts',
    endpoint: 'ilots-de-fraicheur-espaces-verts-frais',
    facets: ['type', 'arrondissement']
  },
  transformer: {
    transform: (record: EspaceVertRecord): EspaceVertResult => ({
      id: record.recordid,
      nom: record.fields.nom || 'Nom non disponible',
      type: record.fields.type || 'Type non défini',
      categorie: record.fields.categorie,
      adresse: record.fields.adresse || 'Adresse non disponible',
      arrondissement: formatArrondissement(record.fields.arrondissement, 'paris'),
      superficie: record.fields.superficie,
      ouvert_24h: record.fields.ouvert_24h,
      latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
      longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
      ouverture: record.fields.ouverture,
      fermeture: record.fields.fermeture,
      canicule_ouverture: record.fields.canicule_ouverture
    })
  },
  fetcher: {
    fetchForType: fetchEspacesVertsForType,
    fetchForCategory: fetchEspacesVertsForCategory
  }
})
