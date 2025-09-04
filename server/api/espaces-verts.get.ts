function formatArrondissement(arrondissement: string | undefined): string {
  if (!arrondissement) return 'Arrondissement non défini'

  if (arrondissement.match(/^750\d{2}$/)) {
    const num = parseInt(arrondissement.substring(3))
    return formatDistrictNumber(num)
  }

  const numMatch = arrondissement.match(/(\d+)/)
  if (numMatch) {
    const num = parseInt(numMatch[1])
    if (num >= 1 && num <= 20) {
      return formatDistrictNumber(num)
    }
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
      return `750${num.toString().padStart(2, '0')}`
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
  const categories = typeof query.categories === 'string' ? [query.categories] : (query.categories as string[]) || []
  const arrondissements = typeof query.arrondissements === 'string' ? [query.arrondissements] : (query.arrondissements as string[]) || []

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
        const apiFormat = convertDisplayToApiFormat(arr)
        params.append('refine.arrondissement', apiFormat)
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
        arrondissement: formatArrondissement(record.fields.arrondissement),
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
    const types = typeof query.types === 'string' ? [query.types] : (query.types as string[]) || []
    const categories = typeof query.categories === 'string' ? [query.categories] : (query.categories as string[]) || []
    const arrondissements = typeof query.arrondissements === 'string' ? [query.arrondissements] : (query.arrondissements as string[]) || []
    return `espaces-verts-${query.page || 1}-${query.pageSize || 20}-${query.search || ''}-${types.join(',')}-${categories.join(',')}-${arrondissements.join(',')}`
  }
})
