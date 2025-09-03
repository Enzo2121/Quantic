export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number.parseInt(query.page as string) || 1
  const pageSize = Number.parseInt(query.pageSize as string) || 20
  const search = query.search as string || ''
  const types = query.types as string[] || []
  const arrondissements = query.arrondissements as string[] || []


  try {
    const params = new URLSearchParams({
      dataset: 'ilots-de-fraicheur-equipements-activites',
      rows: String(pageSize),
      start: String((page - 1) * pageSize),
      facet: ['type', 'payant', 'arrondissement', 'horaires_periode'].join(','),
    })

    if (search) {
      params.append('q', search)
    }

    if (types.length > 0) {
      types.forEach((type) => {
        params.append('refine.type', type)
      })
    }

    if (arrondissements.length > 0) {
      arrondissements.forEach((arr) => {
        params.append('refine.arrondissement', arr)
      })
    }

    const response = await $fetch<{ records: any[], nhits: number, parameters: any }>(`https://opendata.paris.fr/api/records/1.0/search/?${params}`)

    const transformedData = {
      records: response.records.map((record: any) => ({
        id: record.recordid,
        nom: record.fields.nom || 'Nom non disponible',
        type: record.fields.type || 'Type non défini',
        adresse: record.fields.adresse || 'Adresse non disponible',
        arrondissement: record.fields.arrondissement || 'Arrondissement non défini',
        latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
        longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
        payant: record.fields.payant || 'Non spécifié',
        horaires: record.fields.horaires_periode,
      })),
      nhits: response.nhits,
      parameters: response.parameters,
    }

    return transformedData
  }
  catch (error) {
    console.error('API Route - Erreur équipements:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du chargement des équipements sportifs',
    })
  }
}, {
  maxAge: 1000 * 60 * 5, 
  name: 'equipements-sportifs',
  getKey: (event) => {
    const query = getQuery(event)
    return `equipements-${query.page || 1}-${query.pageSize || 20}-${query.search || ''}-${(query.types as string[] || []).join(',')}-${(query.arrondissements as string[] || []).join(',')}`
  },
})
