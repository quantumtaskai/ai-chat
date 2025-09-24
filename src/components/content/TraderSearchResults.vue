<template>
  <div class="trader-search-results h-full flex flex-col bg-white">
    <div class="flex-1 overflow-y-auto">
      <!-- Search Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold mb-2">Trader Search Results</h2>
          <p class="text-blue-100 mb-4">{{ searchSummary }}</p>

          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white/10 rounded-lg p-3 text-center">
              <div class="text-xl font-bold">{{ searchResults.totalCount }}</div>
              <div class="text-sm text-blue-100">Total Traders</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3 text-center">
              <div class="text-xl font-bold">{{ searchResults.filters.countries.length }}</div>
              <div class="text-sm text-blue-100">Countries</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3 text-center">
              <div class="text-xl font-bold">{{ formatVolume(averageVolume) }}</div>
              <div class="text-sm text-blue-100">Avg Volume</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3 text-center">
              <div class="text-xl font-bold">{{ searchResults.filters.types.length }}</div>
              <div class="text-sm text-blue-100">Trade Types</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="border-b border-gray-200 p-4 bg-gray-50">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Country:</label>
              <select v-model="selectedCountry" @change="applyFilters" class="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="">All Countries</option>
                <option v-for="country in searchResults.filters.countries" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Type:</label>
              <select v-model="selectedType" @change="applyFilters" class="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="">All Types</option>
                <option v-for="type in searchResults.filters.types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Sort:</label>
              <select v-model="sortBy" @change="applySorting" class="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="relevance">Relevance</option>
                <option value="volume">Annual Volume</option>
                <option value="experience">Years in Business</option>
                <option value="name">Company Name</option>
              </select>
            </div>

            <button @click="clearFilters" class="text-sm text-blue-600 hover:text-blue-800">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="p-6">
        <div class="max-w-4xl mx-auto">
          <div v-if="filteredTraders.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No traders found</h3>
            <p class="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="trader in paginatedTraders"
              :key="trader.id"
              @click="selectTrader(trader)"
              class="trader-card-compact bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <!-- Trader Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">{{ trader.name }}</h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {{ trader.country }}
                    </span>
                    <span :class="getTypeColor(trader.type)" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium">
                      {{ trader.type }}
                    </span>
                  </div>
                </div>
                <div class="flex-shrink-0 ml-3">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                </div>
              </div>

              <!-- Products -->
              <div class="mb-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="product in trader.products.slice(0, 3)"
                    :key="product"
                    class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                  >
                    {{ product }}
                  </span>
                  <span v-if="trader.products.length > 3" class="text-xs text-gray-500">
                    +{{ trader.products.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Business Metrics -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-600">Volume:</span>
                  <span class="font-medium ml-1">{{ formatVolume(trader.annualVolume) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Experience:</span>
                  <span class="font-medium ml-1">{{ trader.yearsInBusiness }} years</span>
                </div>
              </div>

              <!-- Contact Preview -->
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-600 truncate">
                    {{ trader.contact.person }}
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click.stop="openWhatsApp(trader)"
                      class="p-1 text-green-600 hover:text-green-800"
                      title="WhatsApp"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                      </svg>
                    </button>
                    <button
                      @click.stop="sendEmail(trader)"
                      class="p-1 text-blue-600 hover:text-blue-800"
                      title="Email"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center space-x-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  page === currentPage
                    ? 'text-white bg-blue-600 border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TraderSearchResult, TraderSearchQuery, TraderItem, BusinessConfig } from '@/types'
import { useContentStore } from '@/stores/content'

interface Props {
  content: {
    data: {
      results: TraderSearchResult
      query: TraderSearchQuery
      summary: string
    }
  }
  business: BusinessConfig
}

const props = defineProps<Props>()
const contentStore = useContentStore()

// Reactive state
const selectedCountry = ref('')
const selectedType = ref('')
const sortBy = ref('relevance')
const currentPage = ref(1)
const itemsPerPage = 8

// Computed properties - use content store data if available, fallback to props
const searchResults = computed(() => {
  if (contentStore.traderSearchData?.results) {
    return contentStore.traderSearchData.results
  }
  return props.content.data.results
})

const searchQuery = computed(() => {
  if (contentStore.traderSearchData?.query) {
    return contentStore.traderSearchData.query
  }
  return props.content.data.query
})

const searchSummary = computed(() => {
  if (contentStore.traderSearchData?.summary) {
    return contentStore.traderSearchData.summary
  }
  return props.content.data.summary
})

const originalTraders = computed(() => searchResults.value.traders)

const averageVolume = computed(() => {
  const traders = searchResults.value.traders
  if (traders.length === 0) return 0
  return traders.reduce((sum, trader) => sum + trader.annualVolume, 0) / traders.length
})

const filteredTraders = ref<TraderItem[]>([])
const sortedTraders = ref<TraderItem[]>([])

const paginatedTraders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedTraders.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(sortedTraders.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
function formatVolume(volume: number): string {
  return `$${(volume / 1000000).toFixed(1)}M`
}

function getTypeColor(type: string): string {
  const colors = {
    'Importer': 'bg-green-100 text-green-800',
    'Exporter': 'bg-blue-100 text-blue-800',
    'Both': 'bg-purple-100 text-purple-800'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function applyFilters() {
  let filtered = [...originalTraders.value]

  if (selectedCountry.value) {
    filtered = filtered.filter(trader => trader.country === selectedCountry.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(trader => trader.type === selectedType.value)
  }

  filteredTraders.value = filtered
  applySorting()
  currentPage.value = 1
}

function applySorting() {
  let sorted = [...filteredTraders.value]

  switch (sortBy.value) {
    case 'volume':
      sorted.sort((a, b) => b.annualVolume - a.annualVolume)
      break
    case 'experience':
      sorted.sort((a, b) => b.yearsInBusiness - a.yearsInBusiness)
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'relevance':
    default:
      // Keep original order (already sorted by relevance from search)
      break
  }

  sortedTraders.value = sorted
}

function clearFilters() {
  selectedCountry.value = ''
  selectedType.value = ''
  sortBy.value = 'relevance'
  applyFilters()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function selectTrader(trader: TraderItem) {
  // Show individual trader card
  const traderContent = contentStore.createTraderContentItem(trader)
  contentStore.showContent(traderContent)
}

function openWhatsApp(trader: TraderItem) {
  const message = `Hello ${trader.contact.person}, I found your company ${trader.name} through Far Way Company's trader network. I'm interested in discussing potential business opportunities in ${trader.products.join(', ')}.`
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${trader.contact.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

  // Track interaction
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'trader_contact',
      data: {
        traderId: trader.id,
        contactMethod: 'whatsapp',
        traderName: trader.name,
        country: trader.country,
        source: 'search_results'
      }
    }
  }))
}

function sendEmail(trader: TraderItem) {
  const subject = `Business Inquiry - ${trader.products.join(', ')}`
  const body = `Dear ${trader.contact.person},

I hope this email finds you well. I discovered your company, ${trader.name}, through Far Way Company's international trader network.

I am interested in exploring potential business opportunities with your company, particularly in the following areas:
- ${trader.products.join('\n- ')}

About ${trader.name}:
- Location: ${trader.country}
- Trade Type: ${trader.type}
- Years in Business: ${trader.yearsInBusiness}
- Annual Volume: ${formatVolume(trader.annualVolume)}

I would appreciate the opportunity to discuss how we might work together. Please let me know your availability for a brief call or meeting.

Thank you for your time, and I look forward to hearing from you.

Best regards,
[Your Name]`

  const emailUrl = `mailto:${trader.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = emailUrl

  // Track interaction
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'trader_contact',
      data: {
        traderId: trader.id,
        contactMethod: 'email',
        traderName: trader.name,
        country: trader.country,
        source: 'search_results'
      }
    }
  }))
}

// Watch for new search results and reset filters
watch(searchResults, (newResults) => {
  if (newResults) {
    console.log('TraderSearchResults: New search results detected, resetting filters')
    selectedCountry.value = ''
    selectedType.value = ''
    sortBy.value = 'relevance'
    currentPage.value = 1
    filteredTraders.value = [...originalTraders.value]
    applySorting()
  }
}, { immediate: true })

// Initialize
onMounted(() => {
  filteredTraders.value = [...originalTraders.value]
  applySorting()
})
</script>

<style scoped>
.trader-card-compact:hover {
  transform: translateY(-2px);
}
</style>