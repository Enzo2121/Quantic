// API Route optimisée pour les espaces verts avec cache Nitro
export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  
  const page = Number.parseInt(query.page as string) || 1
  const pageSize = Number.parseInt(query.pageSize as string) || 20
  const search = query.search as string || ''
  const types = query.types as string[] || []
  const categories = query.categories as string[] || []
  const arrondissements = query.arrondissements as string[] || []

  console.log('API Route - Espaces verts:', { page, pageSize, search, types: types.length, categories: categories.length })

  try {
    const params = new URLSearchParams({
      dataset: 'ilots-de-fraicheur-espaces-verts-frais',
      rows: String(pageSize),
      start: String((page - 1) * pageSize),
      facet: ['type', 'arrondissement'].join(',')
    })

    if (search) {
      params.append('q', search)
    }

    if (types.length > 0) {
      types.forEach(type => {
        params.append('refine.type', type)
      })
    }

    if (categories.length > 0) {
      categories.forEach(cat => {
        params.append('refine.categorie', cat)
      })
    }

    if (arrondissements.length > 0) {
      arrondissements.forEach(arr => {
        params.append('refine.arrondissement', arr)
      })
    }

    const response = await $fetch(`https://parisdata.opendatasoft.com/api/records/1.0/search/?${params}`)

    const transformedData = {
      records: response.records.map((record: any) => ({
        id: record.recordid,
        nom: record.fields.nom || 'Nom non disponible',
        type: record.fields.type || 'Type non défini',
        categorie: record.fields.categorie,
        adresse: record.fields.adresse || 'Adresse non disponible',
        arrondissement: record.fields.arrondissement || 'Arrondissement non défini',
        superficie: record.fields.superficie,
        ouvert_24h: record.fields.ouvert_24h,
        latitude: record.geometry?.coordinates?.[1] || record.fields?.geo_point_2d?.[0],
        longitude: record.geometry?.coordinates?.[0] || record.fields?.geo_point_2d?.[1],
        ouverture: record.fields.ouverture,
        fermeture: record.fields.fermeture,
        canicule_ouverture: record.fields.canicule_ouverture
      })),
      nhits: response.nhits,
      parameters: response.parameters
    }

    console.log('API Route - Espaces verts transformés:', transformedData.records.length)
    return transformedData

  } catch (error) {
    console.error('API Route - Erreur espaces verts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du chargement des espaces verts'
    })
  }
}, {
  maxAge: 1000 * 60 * 5, 
  name: 'espaces-verts',
  getKey: (event) => {
    const query = getQuery(event)
    return `espaces-verts-${query.page || 1}-${query.pageSize || 20}-${query.search || ''}-${(query.types as string[] || []).join(',')}-${(query.categories as string[] || []).join(',')}-${(query.arrondissements as string[] || []).join(',')}`
  }
})
