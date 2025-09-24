import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentItem, ContentState, TraderItem, TraderSearchResult, TraderSearchQuery } from '@/types'
import { traderService } from '@/services/traderService'

export const useContentStore = defineStore('content', () => {
  // State
  const currentItem = ref<ContentItem | null>(null)
  const history = ref<ContentItem[]>([])
  const isLoading = ref(false)
  const traderSearchData = ref<any>(null)

  // Getters
  const contentState = computed<ContentState>(() => ({
    currentItem: currentItem.value,
    history: history.value,
    isLoading: isLoading.value
  }))

  const hasContent = computed(() => currentItem.value !== null)

  const canGoBack = computed(() => history.value.length > 0)

  // Actions
  function showContent(item: ContentItem) {
    // Add current item to history if it exists
    if (currentItem.value) {
      history.value.push(currentItem.value)
    }
    
    currentItem.value = item
    
    // Track content view for analytics
    trackContentView(item)
  }

  function goBack() {
    if (history.value.length > 0) {
      currentItem.value = history.value.pop() || null
    }
  }

  function clearContent() {
    currentItem.value = null
    history.value = []
  }

  function showContentById(id: string, businessContent: ContentItem[]) {
    console.log('showContentById: Looking for ID:', id, 'in content:', businessContent.map(c => c.id))

    // Check if it's a trader search results ID
    if (id === 'trader-search-results') {
      // Use reactive trader search data if available, otherwise fallback to global
      if (traderSearchData.value) {
        console.log('showContentById: Using reactive trader search data')
        const searchData = traderSearchData.value
        const searchContent = createTraderSearchResultsContent(searchData.results, searchData.query, searchData.summary)
        showContent(searchContent)
        return
      } else {
        // Fallback to global variable
        const searchData = (window as any).traderSearchResults
        if (searchData) {
          console.log('showContentById: Using global trader search data')
          showTraderSearchResults(searchData.results, searchData.query, searchData.summary)
          return
        } else {
          console.log('showContentById: No trader search results data found')
          return
        }
      }
    }

    // Check if it's a trader content ID
    if (id.startsWith('trader-')) {
      const traderId = id.replace('trader-', '')
      const trader = traderService.getTraderById(traderId)
      if (trader) {
        const traderContent = createTraderContentItem(trader)
        showContent(traderContent)
        return
      }
    }

    const item = businessContent.find(c => c.id === id)
    if (item) {
      console.log('showContentById: Found item:', item.title)
      showContent(item)
    } else {
      console.log('showContentById: Item not found for ID:', id)
    }
  }

  function createTraderContentItem(trader: TraderItem): ContentItem {
    return {
      id: `trader-${trader.id}`,
      type: 'trader',
      title: trader.name,
      description: `${trader.type} from ${trader.country} specializing in ${trader.products.join(', ')}`,
      data: trader,
      tags: trader.tags,
      category: 'trader'
    }
  }

  function createTraderSearchResultsContent(results: TraderSearchResult, query: TraderSearchQuery, summary: string): ContentItem {
    return {
      id: 'trader-search-results',
      type: 'trader-search',
      title: 'Trader Search Results',
      description: summary,
      data: {
        results,
        query,
        summary
      },
      tags: ['traders', 'search', 'results'],
      category: 'trader-search'
    }
  }

  function showTraderSearchResults(results: TraderSearchResult, query: TraderSearchQuery, summary: string) {
    // Update reactive trader search data
    traderSearchData.value = { results, query, summary }

    const searchContent = createTraderSearchResultsContent(results, query, summary)
    showContent(searchContent)

    console.log('Updated trader search data and showing content')
  }

  function showContentByCategory(category: string, businessContent: ContentItem[]) {
    const items = businessContent.filter(c => c.category === category)
    if (items.length > 0) {
      // Show the first item in the category
      showContent(items[0])
    }
  }

  function searchContent(query: string, businessContent: ContentItem[]): ContentItem[] {
    const searchTerm = query.toLowerCase()
    return businessContent.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  function getRelatedContent(currentItem: ContentItem, businessContent: ContentItem[]): ContentItem[] {
    if (!currentItem) return []
    
    return businessContent
      .filter(item => 
        item.id !== currentItem.id &&
        (
          item.category === currentItem.category ||
          item.tags.some(tag => currentItem.tags.includes(tag))
        )
      )
      .slice(0, 3) // Limit to 3 related items
  }

  function trackContentView(item: ContentItem) {
    // Track analytics event
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'content_viewed',
        data: {
          contentId: item.id,
          contentType: item.type,
          title: item.title,
          category: item.category
        }
      }
    }))
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  // Listen for AI content suggestions
  function setupContentSuggestionListener() {
    window.addEventListener('ai-suggest-content', (event: any) => {
      console.log('Content Store: Received ai-suggest-content event:', event.detail)
      const { contentIds, intent } = event.detail
      if (contentIds && contentIds.length > 0) {
        console.log('Content Store: Processing contentIds:', contentIds, 'with intent:', intent)
        console.log('Content Store: Dispatching show-content-by-id:', contentIds[0])
        // We need access to business content to find the item by ID
        // This will be called with the business content from the component
        window.dispatchEvent(new CustomEvent('show-content-by-id', {
          detail: contentIds[0]
        }))
      }
    })
  }

  return {
    // State
    currentItem,
    history,
    isLoading,
    traderSearchData,

    // Getters
    contentState,
    hasContent,
    canGoBack,

    // Actions
    showContent,
    goBack,
    clearContent,
    showContentById,
    showContentByCategory,
    searchContent,
    getRelatedContent,
    trackContentView,
    setLoading,
    setupContentSuggestionListener,
    createTraderContentItem,
    showTraderSearchResults
  }
})