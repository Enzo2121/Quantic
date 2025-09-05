// Utilitaires partagés pour les APIs Open Data Paris
export interface ApiRecord {
  recordid: string
  fields: Record<string, any>
  geometry?: {
    coordinates: [number, number]
  }
}

export interface ApiResponse<T = ApiRecord> {
  records: T[]
  nhits: number
  parameters?: any
}

export interface DatasetConfig {
  name: string
  endpoint: string
  facets: string[]
  searchFields?: string[]
}

// === FORMATAGE ARRONDISSEMENTS ===
export function formatArrondissement(input: string | undefined, sourceType: 'paris' | 'fontaine' = 'paris'): string {
  if (!input) {
    return 'Arrondissement non défini'
  }

  if (sourceType === 'fontaine') {
    const arrMatch = input.match(/PARIS (\d+)(?:ER|EME)? ARRONDISSEMENT/)
    if (arrMatch) {
      const num = Number.parseInt(arrMatch[1])
      return formatDistrictNumber(num)
    }
  }
  else {
    if (input.match(/^750\d{2}$/)) {
      const num = Number.parseInt(input.substring(3))
      return formatDistrictNumber(num)
    }

    const numMatch = input.match(/(\d+)/)
    if (numMatch) {
      const num = Number.parseInt(numMatch[1])
      if (num >= 1 && num <= 20) {
        return formatDistrictNumber(num)
      }
    }
  }

  return 'Arrondissement non défini'
}

export function formatDistrictNumber(num: number): string {
  if (num === 1) {
    return '1er'
  }
  if (num >= 2 && num <= 20) {
    return `${num}ème`
  }
  return `${num}ème`
}

export function convertDisplayToApiFormat(arrondissement: string, targetFormat: 'paris' | 'fontaine' = 'paris'): string {
  if (arrondissement.match(/^750\d{2}$/)) {
    return arrondissement
  }

  const numMatch = arrondissement.match(/^(\d+)(?:er|ème)$/)
  if (numMatch) {
    const num = Number.parseInt(numMatch[1])
    if (num >= 1 && num <= 20) {
      if (targetFormat === 'fontaine') {
        return num === 1 ? '1ER' : `${num}EME`
      }
      else {
        return `750${num.toString().padStart(2, '0')}`
      }
    }
  }

  return arrondissement
}

// === GESTION DES DOUBLONS ===
export function removeDuplicates<T extends { recordid: string }>(records: T[]): T[] {
  const seen = new Set<string>()
  return records.filter((record) => {
    if (seen.has(record.recordid)) {
      return false
    }
    seen.add(record.recordid)
    return true
  })
}

// === PAGINATION ===
export function paginateResults<T>(records: T[], page: number, pageSize: number): { paginatedRecords: T[], totalItems: number } {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    paginatedRecords: records.slice(startIndex, endIndex),
    totalItems: records.length,
  }
}

// === PARSING DES PARAMETRES DE REQUETE ===
export function parseQueryParams(query: Record<string, any>) {
  return {
    page: Number.parseInt(query.page as string) || 1,
    pageSize: Number.parseInt(query.pageSize as string) || 20,
    search: query.search as string || '',
    types: typeof query.types === 'string' ? [query.types] : (query.types as string[]) || [],
    categories: typeof query.categories === 'string' ? [query.categories] : (query.categories as string[]) || [],
    arrondissements: typeof query.arrondissements === 'string' ? [query.arrondissements] : (query.arrondissements as string[]) || [],
    etats: typeof query.etats === 'string' ? [query.etats] : (query.etats as string[]) || [],
  }
}

// === CONSTRUCTION DE CLE DE CACHE ===
export function buildCacheKey(baseName: string, params: ReturnType<typeof parseQueryParams>, version = 'v2'): string {
  const { page, pageSize, search, types, categories, arrondissements, etats } = params

  const segments = [
    `${baseName}-${version}`,
    `${page}`,
    `${pageSize}`,
    search ? `search-${search}` : 'no-search',
    types.length > 0 ? `types-${types.sort().join('|')}` : 'no-types',
    categories.length > 0 ? `cat-${categories.sort().join('|')}` : 'no-cat',
    arrondissements.length > 0 ? `arr-${arrondissements.sort().join('|')}` : 'no-arr',
    etats.length > 0 ? `etats-${etats.sort().join('|')}` : 'no-etats',
  ]

  return segments.join('-')
}

// === CONSTRUCTION PARAMETRES API ===
export function buildApiParams(config: DatasetConfig, params: {
  search?: string
  pageSize: number
  start?: number
  refines?: Record<string, string[]>
}): URLSearchParams {
  const urlParams = new URLSearchParams({
    dataset: config.endpoint,
    rows: String(params.pageSize),
    start: String(params.start || 0),
    facet: config.facets.join(','),
  })

  if (params.search) {
    urlParams.append('q', params.search)
  }

  if (params.refines) {
    Object.entries(params.refines).forEach(([field, values]) => {
      values.forEach((value) => {
        urlParams.append(`refine.${field}`, value)
      })
    })
  }

  return urlParams
}

// === DETECTEUR DE FILTRES MULTIPLES ===
export function needsMultipleQueries(params: ReturnType<typeof parseQueryParams>): boolean {
  return params.types.length > 1
    || params.categories.length > 1
    || params.etats.length > 1
}

// === EXECUTEUR DE REQUETES MULTIPLES ===
export async function executeMultipleQueries<T extends ApiRecord>(
  queries: Array<() => Promise<ApiResponse<T>>>,
  logPrefix: string,
): Promise<{ allRecords: T[], totalFromAPI: number }> {
  console.warn(`[${logPrefix}] Executing ${queries.length} parallel queries`)

  const results = await Promise.all(queries.map(query => query()))

  const allFetchedRecords = results.flatMap(result => result.records)
  const allRecords = removeDuplicates(allFetchedRecords)
  const totalFromAPI = allRecords.length

  console.warn(`[${logPrefix}] Merged ${allFetchedRecords.length} records into ${allRecords.length} unique records`)

  return { allRecords, totalFromAPI }
}