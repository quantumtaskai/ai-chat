<template>
  <div class="pdf-viewer h-full flex flex-col bg-gray-50">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ content.title }}</h3>
        <p class="text-gray-600 mb-4">{{ content.description }}</p>
        <div class="space-y-2">
          <button 
            v-if="content.url"
            @click="openPDF"
            class="btn-primary"
          >
            View PDF
          </button>
          <button 
            v-if="content.url"
            @click="downloadPDF"
            class="btn-secondary"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

const props = defineProps<Props>()

function openPDF() {
  if (props.content.url) {
    window.open(props.content.url, '_blank')
  }
}

function downloadPDF() {
  if (props.content.url) {
    const link = document.createElement('a')
    link.href = props.content.url
    link.download = props.content.title
    link.click()
  }
}
</script>