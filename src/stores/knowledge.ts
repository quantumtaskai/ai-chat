import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScrapedContent, EnhancedKnowledgeItem, BusinessConfig } from '@/types'
import { createBusinessScraper, validateScrapingConfig } from '@/services/businessScraper'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // State
  const scrapedContent = ref<ScrapedContent[]>([])
  const knowledgeBase = ref<EnhancedKnowledgeItem[]>([])
  const isLoading = ref(false)
  const lastScrapedAt = ref<Date | null>(null)
  const scrapingErrors = ref<string[]>([])

  // Getters
  const contentByType = computed(() => {
    const grouped: { [key: string]: ScrapedContent[] } = {}
    scrapedContent.value.forEach(content => {
      if (!grouped[content.contentType]) {
        grouped[content.contentType] = []
      }
      grouped[content.contentType].push(content)
    })
    return grouped
  })

  const contentByPriority = computed(() => {
    return [...scrapedContent.value].sort((a, b) => a.priority - b.priority)
  })

  const totalWordCount = computed(() => {
    return scrapedContent.value.reduce((total, content) => {
      return total + (content.metadata?.wordCount || 0)
    }, 0)
  })

  const recentContent = computed(() => {
    return [...scrapedContent.value]
      .sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime())
      .slice(0, 10)
  })

  // Actions
  async function scrapeBusinessWebsite(business: BusinessConfig): Promise<boolean> {
    if (!business.scrapingConfig || !validateScrapingConfig(business.scrapingConfig)) {
      console.error('Invalid scraping configuration for business:', business.name)
      return false
    }

    isLoading.value = true
    scrapingErrors.value = []

    try {
      console.log(`Starting website scraping for business: ${business.name}`)
      
      const scraper = createBusinessScraper(business)
      
      // Check if scraping is needed
      if (!scraper.needsUpdate()) {
        console.log('Content is up to date, skipping scrape')
        isLoading.value = false
        return true
      }

      // Perform scraping
      const newContent = await scraper.scrapeWebsite()
      
      // Clear old content since we only have one business
      scrapedContent.value = []

      // Add new content
      scrapedContent.value.push(...newContent)

      // Update knowledge base
      await updateKnowledgeBase(newContent)
      
      // Update last scraped timestamp
      scraper.updateLastScraped()
      lastScrapedAt.value = new Date()
      
      // Save to localStorage for persistence
      saveToStorage()
      
      console.log(`Successfully scraped ${newContent.length} items for ${business.name}`)
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown scraping error'
      scrapingErrors.value.push(errorMessage)
      console.error('Scraping failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateKnowledgeBase(content: ScrapedContent[]): Promise<void> {
    // Clear old knowledge items from website since we only have one business
    knowledgeBase.value = knowledgeBase.value.filter(
      item => !item.isFromWebsite
    )

    // Create enhanced knowledge items from scraped content
    const enhancedItems: EnhancedKnowledgeItem[] = content.map((scrapedItem, index) => ({
      id: `scraped-${index}`,
      question: `Information about ${scrapedItem.title}`,
      answer: scrapedItem.content,
      tags: [scrapedItem.contentType, 'website', 'scraped'],
      contentIds: [],
      priority: scrapedItem.priority,
      scrapedContent: [scrapedItem],
      isFromWebsite: true,
      lastUpdated: scrapedItem.scrapedAt
    }))

    knowledgeBase.value.push(...enhancedItems)
  }

  function searchKnowledge(query: string): EnhancedKnowledgeItem[] {
    const searchTerms = query.toLowerCase().split(' ')

    return knowledgeBase.value
      .filter(item => {
        // Search in question, answer, and tags
        const searchableText = [
          item.question,
          item.answer,
          ...item.tags
        ].join(' ').toLowerCase()

        return searchTerms.some(term => searchableText.includes(term))
      })
      .sort((a, b) => b.priority - a.priority)
  }

  function getContentByType(contentType: string): ScrapedContent[] {
    return scrapedContent.value.filter(content =>
      content.contentType === contentType
    )
  }

  function getAllContent(): ScrapedContent[] {
    return scrapedContent.value
  }

  function removeAllContent(): void {
    scrapedContent.value = []
    knowledgeBase.value = knowledgeBase.value.filter(
      item => !item.isFromWebsite
    )
    saveToStorage()
  }

  function clearAllContent(): void {
    scrapedContent.value = []
    knowledgeBase.value = []
    lastScrapedAt.value = null
    scrapingErrors.value = []
    saveToStorage()
  }

  function saveToStorage(): void {
    try {
      const data = {
        scrapedContent: scrapedContent.value,
        knowledgeBase: knowledgeBase.value,
        lastScrapedAt: lastScrapedAt.value,
      }
      localStorage.setItem('ai-receptionist-knowledge', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save knowledge to storage:', error)
    }
  }

  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('ai-receptionist-knowledge')
      if (stored) {
        const data = JSON.parse(stored)
        scrapedContent.value = data.scrapedContent || []
        knowledgeBase.value = data.knowledgeBase || []
        lastScrapedAt.value = data.lastScrapedAt ? new Date(data.lastScrapedAt) : null
      }
    } catch (error) {
      console.error('Failed to load knowledge from storage:', error)
    }
  }

  function getScrapingStats() {
    const content = scrapedContent.value

    const stats = {
      totalItems: content.length,
      totalWords: content.reduce((sum, item) => sum + (item.metadata?.wordCount || 0), 0),
      contentTypes: [...new Set(content.map(item => item.contentType))],
      lastUpdated: content.length > 0
        ? new Date(Math.max(...content.map(item => new Date(item.scrapedAt).getTime())))
        : null,
      averageWordsPerItem: content.length > 0
        ? Math.round(content.reduce((sum, item) => sum + (item.metadata?.wordCount || 0), 0) / content.length)
        : 0
    }

    return stats
  }

  function scheduleAutoScraping(business: BusinessConfig): void {
    if (!business.scrapingConfig?.enabled) return

    const schedule = business.scrapingConfig.updateSchedule
    if (schedule === 'manual') return

    // Calculate next scrape time
    let intervalMs = 0
    switch (schedule) {
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000
        break
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000
        break
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000
        break
    }

    if (intervalMs > 0) {
      console.log(`Scheduling auto-scraping for ${business.name} every ${schedule}`)
      
      // Note: In a real application, you'd want to use a more robust scheduling system
      // This is a simple implementation for demonstration
      setTimeout(async () => {
        await scrapeBusinessWebsite(business)
        scheduleAutoScraping(business) // Reschedule
      }, intervalMs)
    }
  }

  // Initialize store with business knowledge base
  function initialize(business?: BusinessConfig): void {
    loadFromStorage()

    // If business is provided, initialize with its knowledge base
    if (business?.knowledgeBase) {
      console.log(`Knowledge Store: Initializing with ${business.knowledgeBase.length} static knowledge items`)

      const staticKnowledge = business.knowledgeBase.map(item => ({
        ...item,
        isFromWebsite: false,
        lastUpdated: new Date()
      }))

      // Add static knowledge items that aren't already in the knowledge base
      staticKnowledge.forEach(item => {
        const exists = knowledgeBase.value.find(existing => existing.id === item.id)
        if (!exists) {
          knowledgeBase.value.push(item)
          console.log(`Knowledge Store: Added static knowledge item: ${item.id}`)
        }
      })

      console.log(`Knowledge Store: Total knowledge items: ${knowledgeBase.value.length}`)
    } else {
      console.log('Knowledge Store: No business knowledge base provided')
    }
  }

  return {
    // State
    scrapedContent,
    knowledgeBase,
    isLoading,
    lastScrapedAt,
    scrapingErrors,

    // Getters
    contentByType,
    contentByPriority,
    totalWordCount,
    recentContent,

    // Actions
    scrapeBusinessWebsite,
    updateKnowledgeBase,
    searchKnowledge,
    getContentByType,
    getAllContent,
    removeAllContent,
    clearAllContent,
    getScrapingStats,
    scheduleAutoScraping,
    initialize,
    saveToStorage,
    loadFromStorage
  }
})