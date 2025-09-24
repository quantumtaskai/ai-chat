import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BusinessConfig, AppState } from '@/types'
import { useKnowledgeStore } from '@/stores/knowledge'
import { contentScheduler } from '@/services/contentScheduler'

export const useAppStore = defineStore('app', () => {
  // State
  const isMinimized = ref(false)
  const currentBusiness = ref<BusinessConfig | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const appState = computed<AppState>(() => ({
    isMinimized: isMinimized.value,
    currentBusiness: currentBusiness.value,
    isLoading: isLoading.value,
    error: error.value
  }))

  // Actions
  async function initialize() {
    isLoading.value = true
    error.value = null

    try {
      // Load business configuration first
      await loadBusinessConfig()

      // Initialize knowledge store with business data
      const knowledgeStore = useKnowledgeStore()
      knowledgeStore.initialize(currentBusiness.value)

      // Start automated scraping if business is loaded and has scraping config
      if (currentBusiness.value?.scrapingConfig?.enabled) {
        await initializeBusinessScraping(currentBusiness.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize application'
      console.error('App initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadBusinessConfig() {
    try {
      let business = null

      // Try to load from external API first (if configured)
      const apiUrl = import.meta.env.VITE_API_URL
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/business`)
          if (response.ok) {
            business = await response.json()
          }
        } catch (apiErr) {
          console.warn('Failed to load from API, falling back to static data:', apiErr)
        }
      }

      // Fallback to static data if API not available or failed
      if (!business) {
        const businessData = await import('@/data/business.json')
        business = businessData.default
      }

      if (!business) {
        throw new Error('Business configuration not found')
      }

      currentBusiness.value = business
    } catch (err) {
      throw new Error(`Failed to load business configuration: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  function toggleMinimized() {
    isMinimized.value = !isMinimized.value
  }

  function setError(errorMessage: string) {
    error.value = errorMessage
  }

  function clearError() {
    error.value = null
  }

  async function initializeBusinessScraping(business: BusinessConfig) {
    try {
      const knowledgeStore = useKnowledgeStore()
      
      // Check if initial scraping is needed
      const needsScrapingCheck = contentScheduler.needsScraping(business)

      if (needsScrapingCheck) {
        console.log(`Initial scraping needed for ${business.name}`)
        await knowledgeStore.scrapeBusinessWebsite(business)
      } else {
        console.log(`Skipping initial scraping for ${business.name} - not needed`)
      }
      
      // Schedule automated updates
      contentScheduler.scheduleBusinessScraping(business)
      
      console.log(`Automated scraping initialized for ${business.name}`)
    } catch (error) {
      console.error(`Failed to initialize scraping for ${business.name}:`, error)
    }
  }

  function getScrapingStatus() {
    if (!currentBusiness.value) return null
    
    return {
      isScheduled: contentScheduler.isScheduled(),
      needsScraping: contentScheduler.needsScraping(currentBusiness.value),
      nextScrape: contentScheduler.getNextScrapeTime(currentBusiness.value),
      schedule: currentBusiness.value.scrapingConfig?.updateSchedule || 'manual'
    }
  }

  async function forceScrape() {
    if (!currentBusiness.value) return false
    
    try {
      return await contentScheduler.forceScrapeBusiness(currentBusiness.value)
    } catch (error) {
      console.error('Force scrape failed:', error)
      return false
    }
  }

  return {
    // State
    isMinimized,
    currentBusiness,
    isLoading,
    error,

    // Getters
    appState,

    // Actions
    initialize,
    loadBusinessConfig,
    toggleMinimized,
    setError,
    clearError,
    initializeBusinessScraping,
    getScrapingStatus,
    forceScrape
  }
})