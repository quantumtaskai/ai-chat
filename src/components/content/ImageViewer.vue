<template>
  <div class="image-viewer h-full flex flex-col bg-gray-100">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="max-w-full max-h-full">
        <img
          v-if="content.url"
          :src="content.url"
          :alt="content.title"
          class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          @load="imageLoaded = true"
          @error="imageError = true"
        />
        <div v-else-if="imageError" class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21,5V6.59L18.59,9L16.17,6.58L14.75,8L16.17,9.41L13.75,11.83L12.34,10.41L10.92,11.83L12.34,13.25L9.92,15.67L8.5,14.25L7.08,15.67L8.5,17.08L6.08,19.5L4.66,18.08L3.25,19.5L4.66,20.91L2.5,23.08L1.08,21.66L3.25,19.5L1.08,17.33L2.5,15.91L4.66,18.08L6.08,19.5L8.5,17.08L9.92,15.67L12.34,13.25L13.75,11.83L16.17,9.41L18.59,6.99L21,4.4V5Z"/>
          </svg>
          <p class="text-gray-600">Image not available</p>
        </div>
        <div v-else class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Loading image...</p>
        </div>
      </div>
    </div>
    <div class="bg-white border-t border-gray-200 p-4">
      <h3 class="font-semibold text-gray-900 mb-1">{{ content.title }}</h3>
      <p class="text-gray-600 text-sm">{{ content.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

defineProps<Props>()

const imageLoaded = ref(false)
const imageError = ref(false)
</script>