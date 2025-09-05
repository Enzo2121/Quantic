import type { ApiRecord, ApiResponse, DatasetConfig } from './api-utils'
import {
  buildApiParams,
  buildCacheKey,
  convertDisplayToApiFormat,
  executeMultipleQueries,
  needsMultipleQueries,
  paginateResults,
  parseQueryParams,
} from './api-utils'

// === INTERFACE POUR TRANSFORMER LES DONNEES ===
export interface DataTransformer<T extends ApiRecord, R> {
  transform: (record: T) => R
  formatArrondissement?: (input: string | undefined) => string
}

// === INTERFACE POUR FETCHER SPECIFIQUE ===
export interface SpecificFetcher<T extends ApiRecord> {
  fetchForType?: (type: string, search: string, otherFilters: Record<string, string[]>, pageSize: number) => Promise<ApiResponse<T>>
  fetchForCategory?: (category: string, search: string, otherFilters: Record<string, string[]>, pageSize: number) => Promise<ApiResponse<T>>
  fetchForEtat?: (etat: string, search: string, otherFilters: Record<string, string[]>, pageSize: number) => Promise<ApiResponse<T>>
}

// === CONFIGURATION D'API UNIFIEE ===
export interface UnifiedApiConfig<T extends ApiRecord, R> {
  name: string
  dataset: DatasetConfig
  transformer: DataTransformer<T, R>
  fetcher: SpecificFetcher<T>
  baseUrl: string
  cacheMaxAge?: number
}

// === GENERATEUR D'API UNIFIE ===
export function createUnifiedApiHandler<T extends ApiRecord, R>(config: UnifiedApiConfig<T, R>) {
  return defineCachedEventHandler(async (event) => {
    const query = getQuery(event)
    const params = parseQueryParams(query)

    console.warn(`[${config.name}] Processing request:`, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      types: params.types.length,
      categories: params.categories.length,
      etats: params.etats.length,
    })

    try {
      let allRecords: T[] = []
      let totalFromAPI = 0

      if (!needsMultipleQueries(params)) {
        // Requête simple
        allRecords = await executeSingleQuery(config, params)
        totalFromAPI = allRecords.length
      }
      else {
        // Requêtes multiples
        const result = await executeMultipleQueriesForConfig(config, params)
        allRecords = result.allRecords
        totalFromAPI = result.totalFromAPI
      }

      // Pagination
      const { paginatedRecords, totalItems } = paginateResults(allRecords, params.page, params.pageSize)

      // Transformation des données
      const transformedData = {
        records: paginatedRecords.map(record => config.transformer.transform(record)),
        nhits: needsMultipleQueries(params) ? totalItems : totalFromAPI,
        parameters: {
          ...params,
          multipleFiltersQuery: needsMultipleQueries(params),
        },
      }

      console.warn(`[${config.name}] Returning ${transformedData.records.length} records out of ${transformedData.nhits} total`)
      return transformedData
    }
    catch (error) {
      console.error(`[${config.name}] API Error:`, error)
      throw createError({
        statusCode: 500,
        statusMessage: `Erreur lors du chargement des ${config.name}`,
      })
    }
  }, {
    maxAge: config.cacheMaxAge || 1000 * 60 * 5,
    name: config.name,
    getKey: (event) => {
      const query = getQuery(event)
      const params = parseQueryParams(query)
      return buildCacheKey(config.name, params)
    },
  })
}

// === EXECUTION D'UNE REQUETE SIMPLE ===
async function executeSingleQuery<T extends ApiRecord>(
  config: UnifiedApiConfig<T, any>,
  params: ReturnType<typeof parseQueryParams>,
): Promise<T[]> {
  const refines: Record<string, string[]> = {}

  // Filtres simples
  if (params.types.length === 1) {
    refines[getTypeField(config.name)] = params.types
  }
  if (params.categories.length === 1) {
    refines.categorie = params.categories
  }
  if (params.etats.length === 1) {
    refines[getEtatField(config.name)] = params.etats
  }

  // Arrondissements
  if (params.arrondissements.length > 0) {
    const targetFormat = config.name === 'fontaines' ? 'fontaine' : 'paris'
    const formattedArr = params.arrondissements.map((arr) => {
      const formatted = convertDisplayToApiFormat(arr, targetFormat)
      return config.name === 'fontaines' ? `PARIS ${formatted} ARRONDISSEMENT` : formatted
    })
    refines[getArrondissementField(config.name)] = formattedArr
  }

  const apiParams = buildApiParams(config.dataset, {
    search: params.search,
    pageSize: params.pageSize * 2,
    start: (params.page - 1) * params.pageSize,
    refines,
  })

  const response = await $fetch<ApiResponse<T>>(`${config.baseUrl}?${apiParams}`)
  return response.records
}

// === EXECUTION DE REQUETES MULTIPLES ===
async function executeMultipleQueriesForConfig<T extends ApiRecord>(
  config: UnifiedApiConfig<T, any>,
  params: ReturnType<typeof parseQueryParams>,
): Promise<{ allRecords: T[], totalFromAPI: number }> {
  const queries: Array<() => Promise<ApiResponse<T>>> = []
  const pageSize = Math.max(params.pageSize * 3, 100)

  // Autres filtres pour les requêtes
  const otherFilters: Record<string, string[]> = {
    arrondissements: params.arrondissements,
  }

  // Requêtes pour types multiples
  if (params.types.length > 1) {
    params.types.forEach((type) => {
      if (config.fetcher.fetchForType) {
        queries.push(() => config.fetcher.fetchForType!(type, params.search, {
          ...otherFilters,
          categories: params.categories,
          etats: params.etats,
        }, pageSize))
      }
    })
  }

  // Requêtes pour catégories multiples (si pas de types multiples)
  if (params.categories.length > 1 && params.types.length <= 1) {
    params.categories.forEach((category) => {
      if (config.fetcher.fetchForCategory) {
        queries.push(() => config.fetcher.fetchForCategory!(category, params.search, {
          ...otherFilters,
          types: params.types,
          etats: params.etats,
        }, pageSize))
      }
    })
  }

  // Requêtes pour états multiples (si pas de types multiples)
  if (params.etats.length > 1 && params.types.length <= 1) {
    params.etats.forEach((etat) => {
      if (config.fetcher.fetchForEtat) {
        queries.push(() => config.fetcher.fetchForEtat!(etat, params.search, {
          ...otherFilters,
          types: params.types,
          categories: params.categories,
        }, pageSize))
      }
    })
  }

  return executeMultipleQueries(queries, config.name)
}

// === HELPERS POUR LES CHAMPS SPECIFIQUES ===
function getTypeField(apiName: string): string {
  switch (apiName) {
    case 'fontaines': return 'type_objet'
    default: return 'type'
  }
}

function getEtatField(apiName: string): string {
  switch (apiName) {
    case 'fontaines': return 'dispo'
    default: return 'etat'
  }
}

function getArrondissementField(apiName: string): string {
  switch (apiName) {
    case 'fontaines': return 'commune'
    default: return 'arrondissement'
  }
}