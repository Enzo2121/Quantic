function formatArrondissement(commune: string | undefined): string {
  if (!commune) return 'Arrondissement non défini'

  // Format: "PARIS 1ER ARRONDISSEMENT" -> "75001"
  const arrMatch = commune.match(/PARIS (\d+)(?:ER|EME)? ARRONDISSEMENT/)
  if (arrMatch) {
    const num = parseInt(arrMatch[1])
    return `750${num.toString().padStart(2, '0')}`
  }

  return 'Arrondissement non défini'
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
    // Optimisation : si on a des filtres actifs, on peut utiliser un pageSize normal
    // Si pas de filtres, on peut charger plus de données pour permettre la recherche globale
    const hasFilters = types.length > 0 || etats.length > 0 || arrondissements.length > 0 || search.length > 0
    const effectivePageSize = hasFilters ? pageSize : Math.max(pageSize, 1000) // Charger plus de données si pas de filtres

    const params = new URLSearchParams({
      dataset: 'fontaines-a-boire',
      rows: String(effectivePageSize),
      start: String((page - 1) * pageSize), // Garder la pagination côté client
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
        params.append('refine.commune', `PARIS ${arr} EME ARRONDISSEMENT`)
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
