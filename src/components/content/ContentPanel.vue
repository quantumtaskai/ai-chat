<template>
  <div class="content-panel h-full flex flex-col bg-white modern-typography">
    <!-- Header -->
    <div class="content-header px-4 py-3 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            v-if="contentStore.canGoBack"
            @click="contentStore.goBack()"
            class="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title="Go back"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <div class="flex-1">
            <h3 v-if="contentStore.currentItem" class="font-semibold text-gray-900 truncate">
              {{ contentStore.currentItem.title }}
            </h3>
            <h3 v-else class="font-semibold text-gray-900">
              Resources & Information
            </h3>
          </div>
        </div>
        
        <div class="flex items-center space-x-1">
          <!-- Download Button -->
          <button
            v-if="contentStore.currentItem && canDownload"
            @click="downloadContent"
            class="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title="Download"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
          </button>
          
          <!-- Share Button -->
          <button
            v-if="contentStore.currentItem"
            @click="shareContent"
            class="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title="Share"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.6 20.92,19A2.84,2.84 0 0,0 18,16.08Z"/>
            </svg>
          </button>
          
          <!-- Close Button -->
          <button
            v-if="contentStore.currentItem"
            @click="contentStore.clearContent()"
            class="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50/20 transition-all duration-300 backdrop-blur-sm border border-white/10"
            title="Close"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="contentStore.isLoading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Loading content...</p>
        </div>
      </div>

      <!-- Content Display -->
      <div v-else-if="contentStore.currentItem" class="h-full">
        <component 
          :is="getContentComponent(contentStore.currentItem.type)"
          :content="contentStore.currentItem"
          :business="business"
        />
      </div>

      <!-- Default State - Content Library -->
      <div v-else class="p-4 h-full overflow-y-auto custom-scrollbar">
        <div class="space-y-6">
          <!-- Welcome Message -->
          <div class="text-center py-8">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
              <svg class="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ business.name }} Resources</h2>
            <p class="text-sm text-gray-600">Browse our resources or ask me to show you specific information</p>
          </div>


          <!-- Content Categories -->
          <div class="space-y-6">
            <div v-for="category in contentCategories" :key="category.name" class="content-category">
              <h3 class="font-semibold text-gray-900 mb-3 flex items-center text-base">
                <component :is="category.icon" class="w-5 h-5 mr-2 text-primary-600" />
                {{ category.name }}
              </h3>
              <div class="bento-grid">
                <div
                  v-for="(item, index) in category.items"
                  :key="item.id"
                  @click="contentStore.showContent(item)"
                  :class="[
                    'bento-item content-card hover:shadow-deep hover:-translate-y-2 cursor-pointer transition-all duration-500 hover:scale-105 animate-scale-in group',
                    index === 0 && category.items.length > 3 ? 'bento-item-large' : '',
                    index === 1 && category.items.length > 2 ? 'bento-item-wide' : ''
                  ]"
                  :style="{ animationDelay: `${index * 100}ms` }"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <component :is="getTypeIcon(item.type)" class="w-5 h-5 text-gray-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 truncate group-hover:text-primary-700 transition-colors text-sm">{{ item.title }}</h4>
                      <p v-if="item.description" class="text-xs text-gray-600 mt-1 line-clamp-2">
                        {{ item.description }}
                      </p>
                      <div class="flex items-center mt-2 space-x-2">
                        <span
                          v-for="tag in item.tags.slice(0, 2)"
                          :key="tag"
                          class="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {{ tag }}
                        </span>
                        <span v-if="item.tags.length > 2" class="text-xs text-gray-400">
                          +{{ item.tags.length - 2 }} more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Content -->
          <div v-if="popularContent.length > 0" class="space-y-3">
            <h3 class="font-bold text-gray-900 flex items-center text-lg mb-4">
              <svg class="w-6 h-6 mr-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
              </svg>
              Popular Resources
            </h3>
            <div class="grid-responsive">
              <div
                v-for="item in popularContent"
                :key="item.id"
                @click="contentStore.showContent(item)"
                class="flex items-center space-x-4 p-3 hover:bg-white/30 rounded-xl cursor-pointer transition-all duration-300 glass-morphism border border-white/10 hover:shadow-lg hover:-translate-y-0.5"
              >
                <component :is="getTypeIcon(item.type)" class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-700 truncate">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Content -->
    <div v-if="relatedContent.length > 0" class="related-content border-t border-gray-200/30 p-3 glass-morphism backdrop-blur-md">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Related Content</h4>
      <div class="space-y-1">
        <div
          v-for="item in relatedContent"
          :key="item.id"
          @click="contentStore.showContent(item)"
          class="flex items-center space-x-3 p-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-white/50 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm border border-white/10 hover:shadow-md"
        >
          <component :is="getTypeIcon(item.type)" class="w-4 h-4" />
          <span class="truncate">{{ item.title }}</span>
        </div>
      </div>
    </div>

    <!-- Calendar Footer -->
    <div class="calendar-footer border-t border-gray-200/30 glass-morphism p-3 backdrop-blur-md shadow-glass">
      <div class="grid grid-cols-2 gap-2">
        <!-- Schedule Meeting Button -->
        <button
          @click="openMeetingScheduler"
          class="footer-btn bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-150"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
          </svg>
          <span class="text-sm font-medium">Schedule</span>
        </button>

        <!-- Open Calendar Button -->
        <button
          @click="openOSCalendarApp"
          class="footer-btn bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
          <span class="text-sm font-medium">Calendar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, defineAsyncComponent } from 'vue'
import { useContentStore } from '@/stores/content'
import { openOSCalendar } from '@/utils/calendarUtils'
import type { BusinessConfig, ContentItem } from '@/types'

// Lazy-loaded content components for better performance
const PDFViewer = defineAsyncComponent(() => import('./PDFViewer.vue'))
const VideoPlayer = defineAsyncComponent(() => import('./VideoPlayer.vue'))
const ImageViewer = defineAsyncComponent(() => import('./ImageViewer.vue'))
const FormDisplay = defineAsyncComponent(() => import('./FormDisplay.vue'))
const CalculatorWidget = defineAsyncComponent(() => import('./CalculatorWidget.vue'))
const BookingWidget = defineAsyncComponent(() => import('./BookingWidget.vue'))
const WebsiteViewer = defineAsyncComponent(() => import('./WebsiteViewer.vue'))
const LiveContentViewer = defineAsyncComponent(() => import('./LiveContentViewer.vue'))
const ProductCategoryViewer = defineAsyncComponent(() => import('./ProductCategoryViewer.vue'))
const TraderCard = defineAsyncComponent(() => import('./TraderCard.vue'))
const TraderSearchResults = defineAsyncComponent(() => import('./TraderSearchResults.vue'))

interface Props {
  business: BusinessConfig
}

const props = defineProps<Props>()

const contentStore = useContentStore()

// Computed properties
const contentCategories = computed(() => {
  const categories = new Map()
  
  props.business.content.forEach(item => {
    if (!categories.has(item.category)) {
      categories.set(item.category, {
        name: getCategoryDisplayName(item.category),
        icon: getCategoryIcon(item.category),
        items: []
      })
    }
    categories.get(item.category).items.push(item)
  })
  
  return Array.from(categories.values())
})

const popularContent = computed(() => {
  // For demo purposes, just return first 3 items
  // In production, this would be based on analytics
  return props.business.content.slice(0, 3)
})

const relatedContent = computed(() => {
  if (!contentStore.currentItem) return []
  return contentStore.getRelatedContent(contentStore.currentItem, props.business.content)
})

const canDownload = computed(() => {
  if (!contentStore.currentItem) return false
  return ['pdf', 'image'].includes(contentStore.currentItem.type) && contentStore.currentItem.url
})

// Methods
function getCategoryDisplayName(category: string): string {
  const categoryNames = {
    company: 'Company Info',
    services: 'Our Services',
    pricing: 'Pricing & Plans',
    product: 'Products',
    contact: 'Contact Us',
    proof: 'Success Stories',
    billing: 'Billing & Insurance',
    appointment: 'Appointments'
  }
  return categoryNames[category as keyof typeof categoryNames] || category
}

function getCategoryIcon(category: string) {
  const iconMap = {
    company: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z' })
    ]),
    services: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z' })
    ]),
    pricing: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z' })
    ]),
    product: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M16,18L18.29,15.71L17.17,14.59L16,15.76L15.41,15.17L14.29,16.29M10,4A4,4 0 0,1 14,8C14,8.91 13.69,9.75 13.18,10.43L12,9.25L10.82,10.43C10.31,9.75 10,8.91 10,8A4,4 0 0,1 10,4M4,10.54C4,8.66 5.56,7.1 7.44,7.1H16.56C18.44,7.1 20,8.66 20,10.54V10.58C20,10.69 19.99,10.79 19.98,10.9L18.42,12.46C18.2,12.17 17.91,11.93 17.58,11.93H6.42C6.09,11.93 5.8,12.17 5.58,12.46L4.02,10.9C4.01,10.79 4,10.69 4,10.58V10.54Z' })
    ]),
    contact: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M22,4C22,2.89 21.1,2 20,2H4A2,2 0 0,0 2,4V16A2,2 0 0,0 4,18H18L22,22V4Z' })
    ])
  }
  
  return iconMap[category as keyof typeof iconMap] || iconMap.company
}

function getTypeIcon(type: string) {
  const iconMap = {
    pdf: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' })
    ]),
    video: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z' })
    ]),
    image: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z' })
    ]),
    form: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' })
    ]),
    calculator: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z' })
    ]),
    booking: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z' })
    ]),
    website: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })
    ]),
    trader: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' })
    ]),
    'trader-search': () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' })
    ]),
    'live-content': () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z' })
    ]),
    'product-category': () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' })
    ])
  }

  return iconMap[type as keyof typeof iconMap] || iconMap.pdf
}

function getContentComponent(type: string) {
  const componentMap = {
    pdf: PDFViewer,
    video: VideoPlayer,
    image: ImageViewer,
    form: FormDisplay,
    calculator: CalculatorWidget,
    booking: BookingWidget,
    website: WebsiteViewer,
    'live-content': LiveContentViewer,
    'product-category': ProductCategoryViewer,
    trader: TraderCard,
    'trader-search': TraderSearchResults
  }

  return componentMap[type as keyof typeof componentMap] || PDFViewer
}

function downloadContent() {
  if (!contentStore.currentItem || !contentStore.currentItem.url) return
  
  const link = document.createElement('a')
  link.href = contentStore.currentItem.url
  link.download = contentStore.currentItem.title
  link.click()
}

function shareContent() {
  if (!contentStore.currentItem) return
  
  if (navigator.share) {
    navigator.share({
      title: contentStore.currentItem.title,
      text: contentStore.currentItem.description,
      url: contentStore.currentItem.url || window.location.href
    })
  } else {
    // Fallback - copy to clipboard
    const shareText = `${contentStore.currentItem.title}\n${contentStore.currentItem.description || ''}\n${contentStore.currentItem.url || window.location.href}`
    navigator.clipboard.writeText(shareText)
  }
}

// Calendar footer methods
function openMeetingScheduler() {
  // Find the meeting scheduler content item
  const meetingScheduler = props.business.content.find(item => item.id === 'schedule-meeting')
  if (meetingScheduler) {
    // Show the meeting scheduler in the content panel
    contentStore.showContent(meetingScheduler)

    // Track analytics event
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'footer_schedule_clicked',
        data: {
          contentId: 'schedule-meeting',
          business: props.business.name
        }
      }
    }))
  }
}

function openOSCalendarApp() {
  // Open the user's default OS calendar app
  openOSCalendar()
}

onMounted(() => {
  // Setup content suggestion listener
  contentStore.setupContentSuggestionListener()
  
  // Listen for content suggestions
  window.addEventListener('show-content-by-id', (event: any) => {
    console.log('ContentPanel: Received show-content-by-id event:', event.detail)
    const contentId = event.detail
    console.log('ContentPanel: Calling showContentById with:', contentId)
    contentStore.showContentById(contentId, props.business.content)
  })
})
</script>

<style scoped>
/* Modern Typography */
.modern-typography {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
}

.modern-typography * {
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: -0.01em;
  font-feature-settings: 'ss01';
}

.modern-typography h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.modern-typography .text-sm {
  font-size: 12px;
  font-weight: 450;
  line-height: 1.35;
}

.modern-typography .text-xs {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.modern-typography button {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
}

.modern-typography .font-medium {
  font-weight: 500;
}

.modern-typography .font-semibold {
  font-weight: 600;
}

.content-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.content-card {
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.content-card:hover::before {
  left: 100%;
}

/* Enhanced Bento Grid Responsive Behavior */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bento-item-large,
  .bento-item-wide,
  .bento-item-tall {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-item-large {
    grid-column: span 2;
    grid-row: span 1;
  }
}

/* Bento Item Hover Effects */
.bento-item {
  position: relative;
  overflow: hidden;
}

.bento-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.bento-item:hover::after {
  opacity: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

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

/* Calendar Footer Styles */
.calendar-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.footer-btn {
  @apply flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.footer-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.footer-btn:active {
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .footer-btn {
    @apply py-2 px-3 text-xs;
  }

  .footer-btn svg {
    @apply w-3 h-3;
  }
}
</style>