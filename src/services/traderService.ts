import type { TraderItem, TraderSearchQuery, TraderSearchResult, TraderData } from '@/types'

export class TraderService {
  private traderData: TraderData | null = null
  private searchIndex: Map<string, Set<string>> = new Map()

  constructor() {
    this.loadTraderData()
  }

  // Load trader data from JSON file
  async loadTraderData(): Promise<void> {
    try {
      const traderDataModule = await import('@/data/trader.json')
      this.traderData = traderDataModule.default
      this.buildSearchIndex()
      console.log('Trader data loaded successfully:', this.traderData?.traders?.length, 'traders')
    } catch (error) {
      console.error('Failed to load trader data:', error)
    }
  }

  // Build search index for fast querying
  private buildSearchIndex(): void {
    if (!this.traderData) return

    this.searchIndex.clear()

    this.traderData.traders.forEach(trader => {
      // Index by all tags
      trader.tags.forEach(tag => {
        if (!this.searchIndex.has(tag)) {
          this.searchIndex.set(tag, new Set())
        }
        this.searchIndex.get(tag)!.add(trader.id)
      })

      // Index by country (normalized)
      const country = trader.country.toLowerCase().replace(/\s+/g, '-')
      if (!this.searchIndex.has(country)) {
        this.searchIndex.set(country, new Set())
      }
      this.searchIndex.get(country)!.add(trader.id)

      // Index by type
      const type = trader.type.toLowerCase()
      if (!this.searchIndex.has(type)) {
        this.searchIndex.set(type, new Set())
      }
      this.searchIndex.get(type)!.add(trader.id)

      // Index by products
      trader.products.forEach(product => {
        const productKey = product.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!this.searchIndex.has(productKey)) {
          this.searchIndex.set(productKey, new Set())
        }
        this.searchIndex.get(productKey)!.add(trader.id)
      })
    })
  }

  // Parse natural language query into search parameters
  parseQuery(query: string): TraderSearchQuery {
    const lowerQuery = query.toLowerCase()
    const searchQuery: TraderSearchQuery = { query }

    // Extract country patterns
    const countries = this.traderData?.metadata.countries || []
    for (const country of countries) {
      const countryPattern = country.toLowerCase()
      if (lowerQuery.includes(countryPattern)) {
        searchQuery.country = country
        break
      }
    }

    // Extract type patterns
    if (lowerQuery.includes('import') && !lowerQuery.includes('export')) {
      searchQuery.type = 'Importer'
    } else if (lowerQuery.includes('export') && !lowerQuery.includes('import')) {
      searchQuery.type = 'Exporter'
    } else if (lowerQuery.includes('both') || (lowerQuery.includes('import') && lowerQuery.includes('export'))) {
      searchQuery.type = 'Both'
    }

    // Extract product patterns
    const products = this.traderData?.metadata.productCategories || []
    const matchedProducts: string[] = []
    for (const product of products) {
      const productPattern = product.toLowerCase()
      if (lowerQuery.includes(productPattern)) {
        matchedProducts.push(product)
      }
    }
    if (matchedProducts.length > 0) {
      searchQuery.products = matchedProducts
    }

    // Extract volume patterns
    if (lowerQuery.includes('high volume') || lowerQuery.includes('large')) {
      searchQuery.minVolume = 20000000 // $20M+
    } else if (lowerQuery.includes('small') || lowerQuery.includes('new')) {
      searchQuery.maxVolume = 5000000 // Under $5M
    }

    // Extract experience patterns
    if (lowerQuery.includes('experienced') || lowerQuery.includes('veteran')) {
      searchQuery.minYears = 10
    } else if (lowerQuery.includes('new') || lowerQuery.includes('startup')) {
      searchQuery.minYears = 0
      searchQuery.maxVolume = 3
    }

    return searchQuery
  }

  // Search traders based on query
  searchTraders(searchQuery: TraderSearchQuery): TraderSearchResult {
    if (!this.traderData) {
      return {
        traders: [],
        totalCount: 0,
        filters: {
          countries: [],
          products: [],
          types: [],
          volumeRange: { min: 0, max: 0 },
          yearsRange: { min: 0, max: 0 }
        }
      }
    }

    let filteredTraders = [...this.traderData.traders]

    // Apply filters
    if (searchQuery.country) {
      filteredTraders = filteredTraders.filter(trader =>
        trader.country === searchQuery.country
      )
    }

    if (searchQuery.type) {
      filteredTraders = filteredTraders.filter(trader =>
        trader.type === searchQuery.type
      )
    }

    if (searchQuery.products && searchQuery.products.length > 0) {
      filteredTraders = filteredTraders.filter(trader =>
        searchQuery.products!.some(product =>
          trader.products.some(traderProduct =>
            traderProduct.toLowerCase().includes(product.toLowerCase())
          )
        )
      )
    }

    if (searchQuery.minVolume !== undefined) {
      filteredTraders = filteredTraders.filter(trader =>
        trader.annualVolume >= searchQuery.minVolume!
      )
    }

    if (searchQuery.maxVolume !== undefined) {
      filteredTraders = filteredTraders.filter(trader =>
        trader.annualVolume <= searchQuery.maxVolume!
      )
    }

    if (searchQuery.minYears !== undefined) {
      filteredTraders = filteredTraders.filter(trader =>
        trader.yearsInBusiness >= searchQuery.minYears!
      )
    }

    // Apply tag-based search if query text provided
    if (searchQuery.query) {
      const queryWords = searchQuery.query.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2)

      if (queryWords.length > 0) {
        filteredTraders = filteredTraders.filter(trader => {
          const relevanceScore = this.calculateRelevanceScore(trader, queryWords)
          return relevanceScore > 0
        })

        // Sort by relevance
        filteredTraders.sort((a, b) => {
          const scoreA = this.calculateRelevanceScore(a, queryWords)
          const scoreB = this.calculateRelevanceScore(b, queryWords)
          return scoreB - scoreA
        })
      }
    }

    // Calculate filter options from results
    const filters = {
      countries: [...new Set(filteredTraders.map(t => t.country))].sort(),
      products: [...new Set(filteredTraders.flatMap(t => t.products))].sort(),
      types: [...new Set(filteredTraders.map(t => t.type))].sort(),
      volumeRange: {
        min: Math.min(...filteredTraders.map(t => t.annualVolume)),
        max: Math.max(...filteredTraders.map(t => t.annualVolume))
      },
      yearsRange: {
        min: Math.min(...filteredTraders.map(t => t.yearsInBusiness)),
        max: Math.max(...filteredTraders.map(t => t.yearsInBusiness))
      }
    }

    return {
      traders: filteredTraders,
      totalCount: filteredTraders.length,
      filters
    }
  }

  // Calculate relevance score for a trader based on query words
  private calculateRelevanceScore(trader: TraderItem, queryWords: string[]): number {
    let score = 0

    queryWords.forEach(word => {
      // Check tags (highest weight)
      if (trader.tags.some(tag => tag.includes(word))) {
        score += 10
      }

      // Check country (high weight)
      if (trader.country.toLowerCase().includes(word)) {
        score += 8
      }

      // Check products (medium weight)
      if (trader.products.some(product =>
        product.toLowerCase().includes(word)
      )) {
        score += 6
      }

      // Check name (low weight)
      if (trader.name.toLowerCase().includes(word)) {
        score += 3
      }

      // Check type (low weight)
      if (trader.type.toLowerCase().includes(word)) {
        score += 2
      }
    })

    return score
  }

  // Get trader by ID
  getTraderById(id: string): TraderItem | null {
    if (!this.traderData) return null
    return this.traderData.traders.find(trader => trader.id === id) || null
  }

  // Get market insights
  getMarketInsights(): any {
    if (!this.traderData) return null

    const traders = this.traderData.traders
    const totalTraders = traders.length

    // Country distribution
    const countryStats = traders.reduce((acc, trader) => {
      acc[trader.country] = (acc[trader.country] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Type distribution
    const typeStats = traders.reduce((acc, trader) => {
      acc[trader.type] = (acc[trader.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Volume statistics
    const volumes = traders.map(t => t.annualVolume)
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length

    // Experience statistics
    const experiences = traders.map(t => t.yearsInBusiness)
    const avgExperience = experiences.reduce((sum, exp) => sum + exp, 0) / experiences.length

    return {
      totalTraders,
      countryDistribution: Object.entries(countryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({
          country,
          count,
          percentage: Math.round((count / totalTraders) * 100)
        })),
      typeDistribution: typeStats,
      averageVolume: Math.round(avgVolume),
      averageExperience: Math.round(avgExperience),
      volumeRanges: {
        highVolume: traders.filter(t => t.annualVolume > 30000000).length,
        mediumVolume: traders.filter(t => t.annualVolume >= 10000000 && t.annualVolume <= 30000000).length,
        smallVolume: traders.filter(t => t.annualVolume < 10000000).length
      }
    }
  }

  // Check if a query is trader-related
  isTraderQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    const traderKeywords = [
      'trader', 'traders', 'import', 'export', 'supplier', 'suppliers',
      'find', 'search', 'connect', 'show me', 'list', 'who', 'where',
      'textile', 'electronics', 'chemical', 'machinery', 'food', 'spice',
      'china', 'uae', 'germany', 'turkey', 'uk', 'usa', 'india'
    ]

    return traderKeywords.some(keyword => lowerQuery.includes(keyword))
  }

  // Generate response for trader queries
  generateTraderResponse(results: TraderSearchResult, query: TraderSearchQuery): string {
    const { traders, totalCount } = results

    if (totalCount === 0) {
      return `I couldn't find any traders matching "${query.query}". Try searching for different criteria like country, product type, or trade type.`
    }

    let response = ''

    if (totalCount === 1) {
      const trader = traders[0]
      response = `I found 1 trader matching your criteria: ${trader.name} from ${trader.country}, specializing in ${trader.products.join(', ')}.`
    } else if (totalCount <= 5) {
      response = `I found ${totalCount} traders matching your criteria. Here are the top matches:`
    } else {
      response = `I found ${totalCount} traders matching your criteria. Here are the top 5 matches:`
    }

    // Add market insights if applicable
    if (query.country) {
      const countryTraders = traders.filter(t => t.country === query.country).length
      response += ` All ${countryTraders} are based in ${query.country}.`
    }

    if (query.type) {
      response += ` All specialize in ${query.type.toLowerCase()}ing.`
    }

    if (totalCount > 1) {
      const avgVolume = traders.reduce((sum, t) => sum + t.annualVolume, 0) / traders.length
      response += ` Average annual volume: $${(avgVolume / 1000000).toFixed(1)}M.`
    }

    return response
  }
}

// Create singleton instance
export const traderService = new TraderService()