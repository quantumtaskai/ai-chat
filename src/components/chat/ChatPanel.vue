<template>
  <div class="chat-panel flex flex-col h-full bg-gradient-to-b from-gray-50/80 to-white/60 modern-typography">
    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="messages-area flex-1 overflow-y-auto p-4 custom-scrollbar"
    >
      <!-- Virtual Scrolling for large message lists -->
      <div v-if="shouldUseVirtualScroll" ref="virtualScrollContainer" class="h-full">
        <div
          :style="{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }"
        >
          <div
            v-for="virtualRow in virtualizer.getVirtualItems()"
            :key="virtualRow.index"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }"
            class="message-wrapper mb-4"
          >
            <MessageBubble
              :message="chatStore.messages[virtualRow.index]"
              :business="business"
              v-memo="[chatStore.messages[virtualRow.index].id, chatStore.messages[virtualRow.index].content]"
            />
          </div>
        </div>
      </div>

      <!-- Regular rendering for small message lists -->
      <div v-else class="space-y-4">
        <TransitionGroup name="message" tag="div">
          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            class="message-wrapper"
            v-memo="[message.id, message.content, message.timestamp]"
          >
            <MessageBubble :message="message" :business="business" />
          </div>
        </TransitionGroup>
      </div>
      
      <!-- Typing Indicator -->
      <div v-if="chatStore.isTyping" class="flex justify-start">
        <div class="bg-white/90 rounded-2xl px-4 py-3 max-w-xs border border-gray-200/40 animate-pulse">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
              <!-- Modern AI Assistant Icon for typing indicator -->
              <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div v-if="showQuickActions" class="quick-actions px-4 py-2">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="sendQuickAction(action.message)"
          class="px-3 py-1.5 text-xs bg-white/80 border border-gray-200/40 rounded-full hover:bg-white/90 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area bg-white/85 border-t border-gray-200/40 p-4">
      <!-- Voice Status -->
      <div v-if="chatStore.isListening" class="mb-2">
        <div class="flex items-center justify-center space-x-2 text-xs text-blue-600">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Listening... Speak now</span>
        </div>
      </div>

      <!-- Input Row -->
      <div class="flex items-end space-x-2">
        <!-- Voice Button -->
        <button
          @click="toggleVoiceInput"
          :disabled="!voiceSupported"
          class="flex-shrink-0 p-2 rounded-lg transition-all duration-200 focus:outline-none bg-white/80 hover:bg-white/90 border border-gray-200/40"
          :class="voiceButtonClasses"
          :title="voiceButtonTitle"
        >
          <!-- Modern Microphone Icon -->
          <svg v-if="!chatStore.isListening" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
          <!-- Stop Recording Icon -->
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>

        <!-- Mute Button -->
        <button
          @click="toggleMuteAgent"
          :disabled="!voiceSupported"
          class="flex-shrink-0 p-2 rounded-lg transition-all duration-200 focus:outline-none bg-white/80 hover:bg-white/90 border border-gray-200/40"
          :class="muteButtonClasses"
          :title="muteButtonTitle"
        >
          <!-- Modern Speaker On Icon -->
          <svg v-if="!isMuted" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
          <!-- Modern Speaker Off (Muted) Icon -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v3m0 4v2c0 .891-1.077 1.337-1.707.707L5.586 15M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
          </svg>
        </button>


        <!-- Text Input -->
        <div class="flex-1 relative">
          <textarea
            ref="textInput"
            v-model="inputMessage"
            @keydown="handleKeyDown"
            @input="handleInput"
            @focus="emit('inputFocus')"
            placeholder="Type your message or use the microphone..."
            rows="1"
            class="w-full px-4 py-3 bg-white/90 border border-gray-200/40 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary-400/40 focus:border-primary-300/50 transition-all duration-200 placeholder:text-gray-500 text-gray-800 text-sm gpu-accelerated"
            :class="{ 'pr-12': inputMessage.trim() }"
            :disabled="chatStore.isTyping"
          ></textarea>
          
          <!-- Character Count -->
          <div 
            v-if="inputMessage.length > 200"
            class="absolute bottom-1 right-3 text-xs text-gray-400"
          >
            {{ inputMessage.length }}/500
          </div>
        </div>

        <!-- Send Button -->
        <button
          @click="sendMessage"
          :disabled="!canSend"
          class="flex-shrink-0 p-2 rounded-lg transition-all duration-200 focus:outline-none bg-white/80 hover:bg-white/90 border border-gray-200/40"
          :class="sendButtonClasses"
          title="Send message"
        >
          <!-- Modern Send Icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>

      <!-- Status Text -->
      <div class="mt-2 text-xs text-gray-500 text-center">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useChatStore } from '@/stores/chat'
import { useContentStore } from '@/stores/content'
import { useVoice } from '@/composables/useVoice'
import { debounce } from '@/composables/useDebounce'
import { openOSCalendar } from '@/utils/calendarUtils'
import type { BusinessConfig } from '@/types'
import MessageBubble from './MessageBubble.vue'

interface Props {
  business: BusinessConfig
}

const props = defineProps<Props>()

// Emits for widget expansion
const emit = defineEmits<{
  chatStarted: []
  inputFocus: []
}>()

const chatStore = useChatStore()
const contentStore = useContentStore()
const {
  isSupported: voiceSupported,
  isListening,
  isMuted,
  startListening,
  stopListening,
  speak,
  toggleMute
} = useVoice()

// Refs
const messagesContainer = ref<HTMLElement>()
const virtualScrollContainer = ref<HTMLElement>()
const textInput = ref<HTMLTextAreaElement>()

// State
const inputMessage = ref('')
const showQuickActions = ref(true)

// Virtual Scrolling Setup
const shouldUseVirtualScroll = computed(() => chatStore.messages.length > 20)

const virtualizer = useVirtualizer({
  count: () => chatStore.messages.length,
  getScrollElement: () => virtualScrollContainer.value,
  estimateSize: () => 120, // Estimated message height
  overscan: 5, // Render 5 extra items outside viewport
})

// Quick action suggestions
const quickActions = computed(() => [
  { id: 'services', label: 'What FMCG products do you trade?', message: 'What FMCG products do you trade?' },
  { id: 'meeting', label: 'Schedule Meeting', message: 'Can I schedule a meeting?' },
  { id: 'contact', label: 'Connect with traders', message: 'Can you help me connect with traders?' },
  { id: 'demo', label: 'Find textile exporters in Turkey', message: 'Find textile exporters in Turkey' },
])

// Computed properties
const canSend = computed(() => {
  return inputMessage.value.trim().length > 0 && 
         inputMessage.value.length <= 500 && 
         !chatStore.isTyping
})

const voiceButtonClasses = computed(() => ({
  'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow animate-glow': chatStore.isListening,
  'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700': !chatStore.isListening && voiceSupported.value,
  'bg-gray-300/50 text-gray-400 cursor-not-allowed': !voiceSupported.value,
  'animate-pulse': chatStore.isListening
}))

const sendButtonClasses = computed(() => ({
  'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700': canSend.value,
  'bg-gray-300/50 text-gray-400 cursor-not-allowed': !canSend.value
}))

const voiceButtonTitle = computed(() => {
  if (!voiceSupported.value) return 'Voice input not supported'
  return chatStore.isListening ? 'Stop listening' : 'Start voice input'
})

const muteButtonClasses = computed(() => ({
  'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow': isMuted.value,
  'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700': !isMuted.value && voiceSupported.value,
  'bg-gray-300/50 text-gray-400 cursor-not-allowed': !voiceSupported.value
}))

const muteButtonTitle = computed(() => {
  if (!voiceSupported.value) return 'Voice not supported'
  return isMuted.value ? 'Unmute agent voice' : 'Mute agent voice'
})

const statusText = computed(() => {
  if (chatStore.isTyping) return 'AI is typing...'
  if (chatStore.isListening) return 'Listening for your voice...'
  if (!voiceSupported.value) return 'Voice input not available in this browser'
  if (isMuted.value) return 'Agent voice is muted - text responses only'
  return `Powered by QuantumTask AI Assistant`
})

// Methods
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Debounced functions for performance
const debouncedHideQuickActions = debounce(hideQuickActionsAfterTyping, 300)
const debouncedEmitInputFocus = debounce(() => {
  if (inputMessage.value.trim().length > 0) {
    emit('inputFocus')
  }
}, 150)

function handleInput() {
  autoResizeTextarea()
  debouncedHideQuickActions()
  debouncedEmitInputFocus()
}

function autoResizeTextarea() {
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    textInput.value.style.height = Math.min(textInput.value.scrollHeight, 120) + 'px'
  }
}

function hideQuickActionsAfterTyping() {
  if (inputMessage.value.trim().length > 0) {
    showQuickActions.value = false
  } else if (chatStore.messages.length <= 1) {
    showQuickActions.value = true
  }
}

async function sendMessage() {
  if (!canSend.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''
  autoResizeTextarea()

  // Emit chat started for widget expansion
  emit('chatStarted')

  await chatStore.sendMessage(message)

  // Speak the AI response if voice is enabled and not muted
  if (props.business.settings.enableVoice && !isMuted.value) {
    const lastMessage = chatStore.lastMessage
    if (lastMessage && lastMessage.role === 'assistant') {
      speak(lastMessage.content)
    }
  }

  scrollToBottom()
}

function toggleMuteAgent() {
  if (!voiceSupported.value) return
  const newMuteState = toggleMute()
  chatStore.setMuted(newMuteState)
}

function openMeetingScheduler() {
  // Find the meeting scheduler content item
  const meetingScheduler = props.business.content.find(item => item.id === 'schedule-meeting')
  if (meetingScheduler) {
    // Show the meeting scheduler in the content panel
    contentStore.showContent(meetingScheduler)

    // Track analytics event
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'calendar_button_clicked',
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

function sendQuickAction(message: string) {
  inputMessage.value = message
  sendMessage()
  showQuickActions.value = false
}

async function toggleVoiceInput() {
  if (!voiceSupported.value) return

  if (chatStore.isListening) {
    stopListening()
  } else {
    try {
      const transcript = await startListening()
      if (transcript) {
        inputMessage.value = transcript
        autoResizeTextarea()
        // Auto-send after voice input
        setTimeout(() => {
          if (inputMessage.value.trim()) {
            sendMessage()
          }
        }, 500)
      }
    } catch (error) {
      console.error('Voice input error:', error)
    }
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (shouldUseVirtualScroll.value && virtualScrollContainer.value) {
      // For virtual scrolling, scroll to the last item
      virtualizer.scrollToIndex(chatStore.messages.length - 1, {
        align: 'end',
      })
    } else if (messagesContainer.value) {
      // For regular scrolling
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll to bottom
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

// Sync listening state
watch(isListening, (newValue) => {
  chatStore.setListening(newValue)
})

onMounted(() => {
  scrollToBottom()
  
  // Focus input after mount
  nextTick(() => {
    textInput.value?.focus()
  })
})

onUnmounted(() => {
  if (chatStore.isListening) {
    stopListening()
  }
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

.modern-typography button {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
}

.modern-typography input,
.modern-typography textarea {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.modern-typography .text-sm {
  font-size: 12px;
  font-weight: 450;
}

.modern-typography .text-xs {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Message animations */
.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-move {
  transition: transform 0.3s ease;
}

/* Textarea auto-resize */
textarea {
  min-height: 48px;
  max-height: 120px;
  overflow-y: auto;
}

/* Custom scrollbar for messages */
.messages-area {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Quick actions fade in */
.quick-actions {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>