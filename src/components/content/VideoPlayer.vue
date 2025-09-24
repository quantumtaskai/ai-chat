<template>
  <div class="video-player h-full flex flex-col bg-black">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-4xl">
        <div v-if="content.url" class="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            :src="content.url"
            class="w-full h-full"
            frameborder="0"
            allowfullscreen
            :title="content.title"
          ></iframe>
        </div>
        <div v-else class="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <div class="text-center text-white">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
            </svg>
            <p class="text-lg opacity-75">Video not available</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-gray-900 text-white p-4">
      <h3 class="font-semibold mb-1">{{ content.title }}</h3>
      <p class="text-gray-300 text-sm">{{ content.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

defineProps<Props>()
</script>