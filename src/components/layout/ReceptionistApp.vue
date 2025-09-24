<template>
  <div class="receptionist-app h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
    <!-- Header -->
    <div
      class="header flex items-center justify-between px-6 py-4 border-b border-gray-200/30"
      :style="{ background: `linear-gradient(135deg, ${business.branding.primaryColor}ee, ${business.branding.primaryColor}cc)` }"
    >
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200">
          <!-- Modern AI Assistant Icon -->
          <svg class="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-semibold text-white">{{ business.name }}</h1>
          <p class="text-xs text-white/80">AI Assistant</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Minimize Button -->
        <button
          @click="appStore.toggleMinimized()"
          class="p-2 text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 border border-white/10"
          title="Minimize"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        
        <!-- Close Button -->
        <button
          @click="closeReceptionist"
          class="p-2 text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 border border-white/10"
          title="Close"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Content Panel (Left) -->
      <div
        class="content-panel bg-white/90 border-r border-gray-200/30 transition-all duration-200 ease-in-out custom-scrollbar overflow-y-auto"
        :class="contentPanelClasses"
        :style="contentPanelStyle"
      >
        <ContentPanel :business="business" />
      </div>

      <!-- Resize Handle -->
      <div
        v-if="!isMobile"
        class="resize-handle w-2 bg-gradient-to-b from-primary-400/30 to-primary-600/30 hover:from-primary-500/50 hover:to-primary-700/50 cursor-col-resize transition-all duration-200 rounded-full hover:w-3"
        @mousedown="startResize"
      ></div>

      <!-- Chat Panel (Right) -->
      <div
        class="chat-panel flex-1 flex flex-col bg-gradient-to-b from-gray-50/90 to-white/80 min-w-0"
        :class="chatPanelClasses"
      >
        <ChatPanel :business="business" />
      </div>
    </div>

    <!-- Mobile Toggle Buttons -->
    <div v-if="isMobile" class="mobile-toggle-bar flex bg-white/90 border-t border-gray-200/30">
      <button
        @click="showChatOnMobile = true"
        class="flex-1 py-2 text-center font-medium transition-all duration-200 rounded-lg mx-1 text-sm"
        :class="showChatOnMobile ? 'text-primary-600 bg-gradient-to-r from-primary-50 to-blue-50' : 'text-gray-600 hover:bg-gray-50'"
      >
        <!-- Modern Chat Icon -->
        <svg class="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Chat
      </button>
      <button
        @click="showChatOnMobile = false"
        class="flex-1 py-2 text-center font-medium transition-all duration-200 rounded-lg mx-1 text-sm"
        :class="!showChatOnMobile ? 'text-primary-600 bg-gradient-to-r from-primary-50 to-blue-50' : 'text-gray-600 hover:bg-gray-50'"
      >
        <!-- Modern Content Icon -->
        <svg class="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        Content
      </button>
    </div>

    <!-- Minimized State -->
    <Transition name="slide-up">
      <div v-if="appStore.isMinimized" class="minimized-bar bg-white/90 border-t border-gray-200/30 p-3">
        <button
          @click="appStore.toggleMinimized()"
          class="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-sm"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.18 3.12-.5l5.88 1.92-1.92-5.88c.32-.98.5-2.03.5-3.12 0-5.52-4.48-10-10-10z"/>
          </svg>
          <span>{{ business.name }} Assistant</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useChatStore } from '@/stores/chat'
import { useContentStore } from '@/stores/content'
import type { BusinessConfig } from '@/types'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import ContentPanel from '@/components/content/ContentPanel.vue'

interface Props {
  business: BusinessConfig
}

const props = defineProps<Props>()

const appStore = useAppStore()
const chatStore = useChatStore()
const contentStore = useContentStore()

// Responsive state
const isMobile = ref(false)
const showChatOnMobile = ref(true)

// Panel sizing - 70% for content, 30% for chat
const contentPanelWidth = ref(0) // Will be calculated based on window size
const isResizing = ref(false)

// Computed classes for panels
const contentPanelClasses = computed(() => {
  if (isMobile.value) {
    return {
      'absolute inset-0 z-10': !showChatOnMobile.value,
      'hidden': showChatOnMobile.value
    }
  }
  
  return {}
})

const contentPanelStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }
  
  return {
    width: `${contentPanelWidth.value}px`
  }
})

const chatPanelClasses = computed(() => {
  if (isMobile.value) {
    return {
      'absolute inset-0 z-10': showChatOnMobile.value,
      'hidden': !showChatOnMobile.value
    }
  }
  
  return {}
})

// Resize functionality
function startResize(event: MouseEvent) {
  isResizing.value = true
  const startX = event.clientX
  const startWidth = contentPanelWidth.value

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.value) return
    
    const diff = e.clientX - startX
    const newWidth = Math.max(300, Math.min(600, startWidth + diff))
    contentPanelWidth.value = newWidth
  }

  function handleMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// Check if mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

function handleResize() {
  checkMobile()
  // Update content panel width to maintain 70% ratio with min/max bounds
  if (!isMobile.value) {
    const targetWidth = window.innerWidth * 0.7
    contentPanelWidth.value = Math.min(1000, Math.max(400, targetWidth))
  }
}

function closeReceptionist() {
  // For embedded version, this would close the widget
  // For standalone, this could redirect or show a close message
  window.parent?.postMessage({ type: 'quantum-chat', action: 'widget-closed' }, '*')
}

onMounted(() => {
  checkMobile()
  handleResize() // Initialize panel width
  window.addEventListener('resize', handleResize)
  
  // Initialize welcome message
  chatStore.addWelcomeMessage(props.business.settings.welcomeMessage)
  
  // Setup content suggestion listener
  contentStore.setupContentSuggestionListener()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.receptionist-app {
  max-height: 100vh;
}

.resize-handle {
  user-select: none;
  position: relative;
}

.resize-handle:hover {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.resize-handle:hover::before {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .content-panel,
  .chat-panel {
    width: 100% !important;
  }
}

/* Panel transitions */
.content-panel {
  transition: width 0.3s ease-in-out;
}

/* Minimized state animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>