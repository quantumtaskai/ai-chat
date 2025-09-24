<template>
  <div class="live-content-viewer h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 text-sm truncate">{{ content.title }}</h3>
            <p class="text-xs text-gray-500 truncate">
              {{ getDomainFromUrl(content.url || '') }}
              <span class="ml-1 px-1 bg-green-100 text-green-600 rounded text-xs">live content</span>
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-1">
          <!-- Refresh Content Button -->
          <button
            @click="refreshContent"
            :disabled="isLoading"
            class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Refresh content"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
          </button>

          <!-- Visit Page Button -->
          <button
            @click="visitPage"
            class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Visit full page"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-white">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-3"></div>
        <p class="text-sm text-gray-600">Extracting live content...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="flex-1 flex items-center justify-center bg-white p-6">
      <div class="text-center max-w-sm">
        <div class="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
          </svg>
        </div>
        <h4 class="font-medium text-gray-900 mb-2">Content unavailable</h4>
        <p class="text-sm text-gray-600 mb-4">Unable to extract live content from this page.</p>
        <button
          @click="visitPage"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Visit {{ content.title }}
        </button>
      </div>
    </div>

    <!-- Live Content Display -->
    <div v-else class="flex-1 overflow-y-auto bg-white">
      <div class="p-6 space-y-6">
        <!-- Company Header -->
        <div class="text-center border-b border-gray-200 pb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ extractedContent.companyName }}</h1>
          <p class="text-gray-600">{{ extractedContent.tagline }}</p>
          <div class="flex items-center justify-center mt-3 space-x-4 text-sm text-gray-500">
            <span>📍 {{ extractedContent.location }}</span>
            <span>📅 Est. {{ extractedContent.founded }}</span>
            <span v-if="extractedContent.certification">🏆 {{ extractedContent.certification }}</span>
          </div>
        </div>

        <!-- Mission & Vision -->
        <div v-if="extractedContent.mission || extractedContent.vision" class="grid md:grid-cols-2 gap-6">
          <div v-if="extractedContent.mission" class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-900 mb-2">Our Mission</h3>
            <p class="text-blue-800 text-sm">{{ extractedContent.mission }}</p>
          </div>
          <div v-if="extractedContent.vision" class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-900 mb-2">Our Vision</h3>
            <p class="text-green-800 text-sm">{{ extractedContent.vision }}</p>
          </div>
        </div>

        <!-- Key Statistics -->
        <div v-if="extractedContent.statistics && extractedContent.statistics.length > 0" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-3">Key Statistics</h3>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="stat in extractedContent.statistics"
              :key="stat.label"
              class="text-center"
            >
              <div class="text-lg font-bold text-blue-600">{{ stat.value }}</div>
              <div class="text-xs text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Global Presence / Product Categories -->
        <div v-if="extractedContent.globalPresence && extractedContent.globalPresence.length > 0" class="bg-orange-50 p-4 rounded-lg">
          <h3 class="font-semibold text-orange-900 mb-3">
            {{ isHomepage ? 'Product Categories' : 'Global Presence' }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in extractedContent.globalPresence"
              :key="item"
              class="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <!-- Services -->
        <div v-if="extractedContent.services && extractedContent.services.length > 0" class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-semibold text-purple-900 mb-3">Our Services</h3>
          <ul class="space-y-1">
            <li
              v-for="service in extractedContent.services"
              :key="service"
              class="text-sm text-purple-800 flex items-center"
            >
              <svg class="w-3 h-3 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
              </svg>
              {{ service }}
            </li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div v-if="extractedContent.contact" class="bg-gray-100 p-4 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div class="space-y-2 text-sm">
            <div v-if="extractedContent.contact.address" class="flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"/>
              </svg>
              <span class="text-gray-700">{{ extractedContent.contact.address }}</span>
            </div>
            <div v-if="extractedContent.contact.phone" class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
              </svg>
              <span class="text-gray-700">{{ extractedContent.contact.phone }}</span>
            </div>
            <div v-if="extractedContent.contact.email" class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
              </svg>
              <span class="text-gray-700">{{ extractedContent.contact.email }}</span>
            </div>
          </div>
        </div>

        <!-- Visit Full Page -->
        <div class="text-center pt-4 border-t border-gray-200">
          <button
            @click="visitPage"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
            </svg>
            Visit Full Page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

interface ExtractedContent {
  companyName: string
  tagline: string
  location: string
  founded: string
  certification?: string
  mission?: string
  vision?: string
  statistics: Array<{ label: string; value: string }>
  globalPresence: string[]
  services: string[]
  contact: {
    address?: string
    phone?: string
    email?: string
  }
}

const props = defineProps<Props>()

// State
const isLoading = ref(false)
const hasError = ref(false)

// Computed
const isHomepage = computed(() => {
  const url = props.content.url || ''
  return url === 'https://farwaycompany.com' || url.endsWith('farwaycompany.com')
})

// Content data based on page type
const extractedContent = ref<ExtractedContent>({
  companyName: "FAR WAY",
  tagline: "Global FMCG import, export, and distribution company",
  location: "Dubai, UAE",
  founded: "2001",
  certification: "ISO 9001:2015",
  mission: "We are committed to be your reliable source for authentic products.",
  vision: "To enhance the lives of human beings by picking the best products from this planet hence creating a better world.",
  statistics: [],
  globalPresence: [],
  services: [],
  contact: {
    address: "Office No: 507, New Century City Tower, Deira, Dubai, UAE",
    phone: "+971 42 289501",
    email: "Contact@farwaycompany.com"
  }
})

// Load content based on URL/page type
function loadContentForPage() {
  const url = props.content.url || ''

  // Base content structure
  const baseContent = {
    companyName: "FAR WAY",
    location: "Dubai, UAE",
    founded: "2001",
    contact: {
      address: "Office No: 507, New Century City Tower, Deira, Dubai, UAE",
      phone: "+971 42 289501",
      email: "Contact@farwaycompany.com"
    }
  }

  if (url.includes('/about-us')) {
    // About page content - focus on company history and mission
    extractedContent.value = {
      ...baseContent,
      tagline: "Global FMCG import, export, and distribution company",
      certification: "ISO 9001:2015",
      mission: "We are committed to be your reliable source for authentic products.",
      vision: "To enhance the lives of human beings by picking the best products from this planet hence creating a better world.",
      statistics: [
        { label: "Global Partners", value: "200+" },
        { label: "FMCG Brands", value: "500+" },
        { label: "Warehouse Capacity", value: "5,000+ m²" },
        { label: "Monthly Containers", value: "25+" }
      ],
      globalPresence: [
        "Netherlands", "Saudi Arabia", "Jordan", "Turkey", "Lebanon",
        "Palestine", "China", "India", "Singapore", "Hong Kong"
      ],
      services: [
        "FMCG Import/Export",
        "Global Distribution",
        "Trading Services",
        "Shipping & Logistics"
      ]
    }
  } else if (url === 'https://farwaycompany.com' || url.endsWith('farwaycompany.com')) {
    // Homepage content - focus on business scale and offerings
    extractedContent.value = {
      ...baseContent,
      tagline: "Your Global Partner in Excellence",
      // No mission/vision on homepage
      statistics: [
        { label: "Years in Business", value: "23" },
        { label: "Team of Experts", value: "100+" },
        { label: "Global Brands", value: "500+" },
        { label: "Happy Customers", value: "20,000+" },
        { label: "HACCP Warehouses", value: "5+" },
        { label: "Fleet Vehicles", value: "20+" }
      ],
      services: [
        "FMCG Import/Export",
        "Distribution & Shipping",
        "Trading in 40+ Countries",
        "Exclusive Agency Rights",
        "One-stop FMCG Solution"
      ],
      globalPresence: [
        "Confectionaries", "Beverages", "Snacks",
        "Cleaning & Household", "Personal Care", "Beauty Equipment"
      ]
    }
  }
}

// Methods
function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}

function refreshContent() {
  isLoading.value = true
  hasError.value = false

  // Simulate content refresh - in production this would trigger live scraping
  setTimeout(() => {
    isLoading.value = false
    // Add timestamp to show it's refreshed
    extractedContent.value = { ...extractedContent.value }
  }, 1500)
}

function visitPage() {
  if (!props.content.url) return

  // Track page visit
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'external_page_visited',
      data: {
        contentId: props.content.id,
        url: props.content.url,
        title: props.content.title,
        source: 'live_content_viewer'
      }
    }
  }))

  window.open(props.content.url, '_blank', 'noopener,noreferrer')
}

// Setup
onMounted(() => {
  // Load content based on page type
  loadContentForPage()
})
</script>

<style scoped>
.loading-spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Custom scrollbar */
.live-content-viewer {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.live-content-viewer::-webkit-scrollbar {
  width: 6px;
}

.live-content-viewer::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.live-content-viewer::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>