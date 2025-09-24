<template>
  <div class="message-bubble-wrapper" :class="alignmentClass">
    <div class="flex items-end space-x-2" :class="flexDirection">
      <!-- Avatar -->
      <div v-if="showAvatar" class="flex-shrink-0">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          :class="avatarClasses"
        >
          {{ avatarText }}
        </div>
      </div>

      <!-- Message Content -->
      <div class="message-content max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <!-- Message Bubble -->
        <div
          class="px-5 py-4 rounded-2xl transition-colors duration-150"
          :class="bubbleClasses"
        >

          <!-- Message Text -->
          <div class="message-text" :class="textClasses">
            {{ message.content }}
          </div>

          <!-- Attachments/Content References -->
          <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-1">
            <div
              v-for="attachment in message.attachments"
              :key="attachment.id"
              @click="viewAttachment(attachment)"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-150 border border-gray-200"
            >
              <div class="flex-shrink-0">
                <component :is="getAttachmentIcon(attachment.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ attachment.title }}</div>
                <div class="text-xs opacity-70 truncate">{{ attachment.description }}</div>
              </div>
              <div class="flex-shrink-0">
                <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamp -->
        <div 
          class="text-xs text-gray-500 mt-1 px-1"
          :class="timestampAlignment"
        >
          {{ formatTime(message.timestamp) }}
        </div>
      </div>

      <!-- Message Actions -->
      <div v-if="showActions" class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex flex-col space-y-1">
          <!-- Speak Button -->
          <button
            v-if="message.role === 'assistant' && business.settings.enableVoice"
            @click="speakMessage"
            class="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-150 border border-gray-200"
            title="Speak this message"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          </button>

          <!-- Copy Button -->
          <button
            @click="copyMessage"
            class="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors duration-150 border border-gray-200"
            title="Copy message"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useContentStore } from '@/stores/content'
import { useVoice } from '@/composables/useVoice'
import type { Message, BusinessConfig, ContentItem } from '@/types'

interface Props {
  message: Message
  business: BusinessConfig
}

const props = defineProps<Props>()

const contentStore = useContentStore()
const { speak } = useVoice()

// Computed properties
const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')
const showAvatar = computed(() => isAssistant.value)
const showSenderLabel = computed(() => isAssistant.value)
const showActions = computed(() => isAssistant.value)

const alignmentClass = computed(() => ({
  'flex justify-end': isUser.value,
  'flex justify-start': isAssistant.value,
  'group': showActions.value
}))

const flexDirection = computed(() => ({
  'flex-row-reverse': isUser.value,
  'flex-row': isAssistant.value
}))

const avatarClasses = computed(() => {
  if (isUser.value) {
    return 'bg-primary-600'
  }
  return 'bg-purple-600'
})

const avatarText = computed(() => {
  if (isUser.value) {
    return 'U'
  }
  return 'AI'
})

const bubbleClasses = computed(() => ({
  'bg-primary-600 text-white': isUser.value,
  'bg-white text-gray-900 border border-gray-200': isAssistant.value,
  'rounded-br-lg': isUser.value,
  'rounded-bl-lg': isAssistant.value
}))

const textClasses = computed(() => ({
  'text-white': isUser.value,
  'text-gray-900': isAssistant.value
}))

const timestampAlignment = computed(() => ({
  'text-right': isUser.value,
  'text-left': isAssistant.value
}))

// Methods
function formatTime(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(timestamp)
}

function getAttachmentIcon(type: string) {
  const iconMap = {
    pdf: () => h('svg', { 
      class: 'w-4 h-4 text-red-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' })
    ]),
    video: () => h('svg', { 
      class: 'w-4 h-4 text-purple-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z' })
    ]),
    image: () => h('svg', { 
      class: 'w-4 h-4 text-green-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z' })
    ]),
    form: () => h('svg', { 
      class: 'w-4 h-4 text-blue-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' })
    ]),
    calculator: () => h('svg', { 
      class: 'w-4 h-4 text-orange-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z' })
    ]),
    booking: () => h('svg', { 
      class: 'w-4 h-4 text-indigo-500', 
      fill: 'currentColor', 
      viewBox: '0 0 24 24' 
    }, [
      h('path', { d: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z' })
    ])
  }
  
  return iconMap[type as keyof typeof iconMap] || iconMap.pdf
}

function viewAttachment(attachment: ContentItem) {
  contentStore.showContent(attachment)
  
  // Track content view
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'content_viewed',
      data: {
        contentId: attachment.id,
        source: 'message_attachment',
        messageId: props.message.id
      }
    }
  }))
}

function speakMessage() {
  speak(props.message.content)
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // Could show a toast notification here
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    console.error('Failed to copy message:', error)
  }
}
</script>

<style scoped>
.message-bubble-wrapper {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message content styling */
.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

/* Hover effects for actions */
.group:hover .opacity-0 {
  opacity: 1;
}
</style>