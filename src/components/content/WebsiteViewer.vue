<template>
  <div class="website-viewer h-full flex flex-col bg-gray-50">
    <!-- Toggle Controls -->
    <div class="bg-white border-b border-gray-200 p-3">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Display mode:</span>
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="displayMode = 'preview'"
              :class="displayModeClasses('preview')"
              class="px-3 py-1 text-xs rounded transition-colors"
            >
              Preview
            </button>
            <button
              @click="displayMode = 'live'"
              :class="displayModeClasses('live')"
              class="px-3 py-1 text-xs rounded transition-colors"
            >
              Live Page
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Website Display -->
    <div v-if="displayMode === 'live' && content.url" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center max-w-sm">
        <div class="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
          </svg>
        </div>
        <h4 class="font-medium text-gray-900 mb-2">Live view not available</h4>
        <p class="text-sm text-gray-600 mb-4">Use the button below to visit the full page</p>
        <button
          @click="openWebsite"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open {{ content.title }}
        </button>
      </div>
    </div>

    <!-- Original Preview Display -->
    <div v-else class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-4xl">
        <div v-if="content.url" class="bg-white rounded-lg overflow-hidden shadow-lg">
          <!-- Website Preview Header -->
          <div class="bg-gray-100 border-b border-gray-200 p-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ content.title }}</h3>
                <p class="text-sm text-gray-600">{{ content.description }}</p>
              </div>
            </div>
          </div>

          <!-- Website Preview or Link -->
          <div class="aspect-video bg-gray-100 flex items-center justify-center">
            <div class="text-center max-w-sm">
              <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Visit Our Website</h4>
              <p class="text-gray-600 mb-4">Click the button below to open this page in a new tab</p>
              <div class="space-y-2">
                <button 
                  @click="openWebsite"
                  class="btn-primary"
                >
                  Open {{ content.title }}
                </button>
                <div class="text-xs text-gray-500">
                  {{ getDomainFromUrl(content.url) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <p class="text-gray-600">Website not available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

const props = defineProps<Props>()

// State
const displayMode = ref<'preview' | 'live'>('preview')

// Computed
const displayModeClasses = computed(() => {
  return (mode: 'preview' | 'live') => ({
    'bg-white text-gray-900 shadow-sm': displayMode.value === mode,
    'text-gray-600 hover:text-gray-900': displayMode.value !== mode
  })
})

function openWebsite() {
  if (props.content.url) {
    // Track website visit
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'website_visited',
        data: {
          contentId: props.content.id,
          url: props.content.url,
          title: props.content.title,
          business: props.business.name
        }
      }
    }))
    
    // Open in new tab
    window.open(props.content.url, '_blank', 'noopener,noreferrer')
  }
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}
</script>

<style scoped>
.website-viewer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
</style>