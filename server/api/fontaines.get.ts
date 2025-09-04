function formatArrondissement(commune: string | undefined): string {
  if (!commune) return 'Arrondissement non défini'

  const arrMatch = commune.match(/PARIS (\d+)(?:ER|EME)? ARRONDISSEMENT/)
  if (arrMatch) {
    const num = parseInt(arrMatch[1])
    return formatDistrictNumber(num)
  }

  return 'Arrondissement non défini'
}

function formatDistrictNumber(num: number): string {
  if (num === 1) {
    return '1er'
  } else if (num >= 2 && num <= 20) {
    return `${num}ème`
  }
  return `${num}ème`
}

function convertDisplayToApiFormat(arrondissement: string): string {
  if (arrondissement.match(/^750\d{2}$/)) {
    return arrondissement
  }

  const numMatch = arrondissement.match(/^(\d+)(?:er|ème)$/)
  if (numMatch) {
    const num = parseInt(numMatch[1])
    if (num >= 1 && num <= 20) {
      return num === 1 ? '1ER' : `${num}EME`
    }
  }

  return arrondissement
}

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  
  const page = Number.parseInt(query.page as string) || 1
  const pageSize = Number.parseInt(query.pageSize as string) || 20
  const search = query.search as string || ''
  const types = typeof query.types === 'string' ? [query.types] : (query.types as string[]) || []
  const arrondissements = typeof query.arrondissements === 'string' ? [query.arrondissements] : (query.arrondissements as string[]) || []
  const etats = typeof query.etats === 'string' ? [query.etats] : (query.etats as string[]) || []

  console.log('🔄 API Route - Fontaines:', { page, pageSize, search, types: types.length, etats: etats.length })

  try {
    const params = new URLSearchParams({
      dataset: 'fontaines-a-boire',
      rows: String(pageSize),
      start: String((page - 1) * pageSize),
      facet: ['type_objet', 'dispo', 'commune'].join(',')
    })

    if (search) {
      params.append('q', search)
    }

    if (types.length > 0) {
      types.forEach(type => {
        params.append('refine.type_objet', type)
      })
    }

    if (etats.length > 0) {
      etats.forEach(etat => {
        params.append('refine.dispo', etat)
      })
    }

    if (arrondissements.length > 0) {
      arrondissements.forEach(arr => {
        const apiFormat = convertDisplayToApiFormat(arr)
        params.append('refine.commune', `PARIS ${apiFormat} ARRONDISSEMENT`)
      })
    }

    const response = await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)

    const transformedData = {
      records: response.records.map((record: any) => ({
        id: record.recordid,
        nom: `Fontaine ${record.fields.voie || 'sans nom'}`,
        type: record.fields.type_objet || 'Type non défini',
        adresse: `${record.fields.no_voirie_pair || record.fields.no_voirie_impair || ''} ${record.fields.voie || ''}`.trim(),
        arrondissement: formatArrondissement(record.fields.commune),
        etat: record.fields.dispo || 'État non défini',
        latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
        longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
        modele: record.fields.modele
      })),
      nhits: response.nhits,
      parameters: response.parameters
    }

    console.log('API Route - Fontaines transformées:', transformedData.records.length)
    return transformedData

  } catch (error) {
    console.error('API Route - Erreur fontaines:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du chargement des fontaines'
    })
  }
}, {
  maxAge: 1000 * 60 * 5, 
  name: 'fontaines',
  getKey: (event) => {
    const query = getQuery(event)
    const types = typeof query.types === 'string' ? [query.types] : (query.types as string[]) || []
    const etats = typeof query.etats === 'string' ? [query.etats] : (query.etats as string[]) || []
    const arrondissements = typeof query.arrondissements === 'string' ? [query.arrondissements] : (query.arrondissements as string[]) || []
    return `fontaines-${query.page || 1}-${query.pageSize || 20}-${query.search || ''}-${types.join(',')}-${etats.join(',')}-${arrondissements.join(',')}`
  }
})
