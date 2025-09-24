<template>
  <div class="widget-container" :class="containerClasses">
    <!-- Minimized Card State -->
    <Transition name="card-minimize">
      <div
        v-if="!isExpanded"
        class="minimized-card"
        :class="minimizedCardClasses"
        :style="minimizedCardStyle"
        @click="expandWidget"
      >
        <div class="flex items-center space-x-3 p-4">
          <!-- Business Logo/Icon -->
          <div class="widget-icon">
            <div
              v-if="business?.branding?.logo"
              class="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center"
            >
              <img :src="business.branding.logo" :alt="business.name" class="w-6 h-6 object-contain" />
            </div>
            <div v-else class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.18 3.12-.5l5.88 1.92-1.92-5.88c.32-.98.5-2.03.5-3.12 0-5.52-4.48-10-10-10z"/>
              </svg>
            </div>
          </div>

          <!-- Business Info -->
          <div class="flex-1 text-left">
            <div class="text-sm font-semibold text-white">{{ business?.name || 'AI Assistant' }}</div>
            <div class="text-xs text-white/80">Click to chat</div>
          </div>

          <!-- Expand Indicator -->
          <div class="text-white/80">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </div>

        <!-- Pulse Animation for Attention -->
        <div
          v-if="showPulse"
          class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"
        ></div>
      </div>
    </Transition>

    <!-- Expanded Card State -->
    <Transition name="card-expand">
      <div
        v-if="isExpanded"
        class="expanded-card"
        :class="expandedCardClasses"
        :style="expandedCardStyle"
      >
        <!-- Card Header -->
        <div
          class="card-header flex items-center justify-between px-4 py-3 border-b border-gray-200"
          :style="{ backgroundColor: business?.branding?.primaryColor || '#3b82f6' }"
        >
          <div class="flex items-center space-x-3">
            <div
              v-if="business?.branding?.logo"
              class="w-6 h-6 rounded overflow-hidden bg-white flex items-center justify-center"
            >
              <img :src="business.branding.logo" :alt="business.name" class="w-4 h-4 object-contain" />
            </div>
            <div v-else class="w-6 h-6 bg-white rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.18 3.12-.5l5.88 1.92-1.92-5.88c.32-.98.5-2.03.5-3.12 0-5.52-4.48-10-10-10z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold text-white">{{ business?.name || 'AI Assistant' }}</div>
            </div>
          </div>

          <div class="flex items-center space-x-1">
            <!-- Resize Handle -->
            <button
              v-if="!isMobile && allowResize"
              class="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              @mousedown="startResize"
              title="Resize"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 22H2v-2h20v2zm0-4H2v-2h20v2zm0-4H2v-2h20v2z"/>
              </svg>
            </button>

            <!-- Minimize Button -->
            <button
              class="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              @click="minimizeWidget"
              title="Minimize"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>

            <!-- Close Button -->
            <button
              class="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              @click="closeWidget"
              title="Close"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content flex flex-1 overflow-hidden">
          <!-- Desktop: Dual Panel Layout -->
          <template v-if="!isMobile">
            <!-- Content Panel -->
            <div
              class="content-panel bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar"
              :style="{ width: `${contentPanelWidth}px` }"
            >
              <ContentPanel :business="business" />
            </div>

            <!-- Resize Handle -->
            <div
              v-if="allowResize"
              class="resize-handle w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors"
              @mousedown="startPanelResize"
            ></div>

            <!-- Chat Panel -->
            <div class="chat-panel flex-1 flex flex-col bg-gray-50 min-w-0">
              <ChatPanel :business="business" />
            </div>
          </template>

          <!-- Mobile: Single Panel with Toggle -->
          <template v-else>
            <div class="mobile-content flex-1 flex flex-col">
              <!-- Content Panel -->
              <div
                v-if="!showChatOnMobile"
                class="flex-1 bg-white overflow-y-auto custom-scrollbar"
              >
                <ContentPanel :business="business" />
              </div>

              <!-- Chat Panel -->
              <div
                v-if="showChatOnMobile"
                class="flex-1 flex flex-col bg-gray-50"
              >
                <ChatPanel :business="business" />
              </div>

              <!-- Mobile Toggle Bar -->
              <div class="mobile-toggle-bar flex bg-white border-t border-gray-200">
                <button
                  @click="showChatOnMobile = true"
                  class="flex-1 py-2 text-center text-xs font-medium transition-colors"
                  :class="showChatOnMobile ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                >
                  Chat
                </button>
                <button
                  @click="showChatOnMobile = false"
                  class="flex-1 py-2 text-center text-xs font-medium transition-colors"
                  :class="!showChatOnMobile ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                >
                  Info
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Click Outside Overlay (Mobile) -->
    <div
      v-if="isExpanded && isMobile && showOverlay"
      class="fixed inset-0 bg-black bg-opacity-20 z-40"
      @click="minimizeWidget"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { BusinessConfig } from '@/types'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import ContentPanel from '@/components/content/ContentPanel.vue'

export interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'sidebar-right' | 'sidebar-left'
  size?: 'compact' | 'medium' | 'large'
  allowResize?: boolean
  showPulse?: boolean
  showOverlay?: boolean
  autoExpand?: boolean
  expandDelay?: number
}

interface Props {
  business: BusinessConfig
  config?: WidgetConfig
  initialExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    position: 'bottom-right',
    size: 'medium',
    allowResize: true,
    showPulse: true,
    showOverlay: true,
    autoExpand: false,
    expandDelay: 3000
  }),
  initialExpanded: false
})

// Emits for parent communication
const emit = defineEmits<{
  expanded: []
  minimized: []
  closed: []
  resized: [width: number, height: number]
}>()

// Widget state
const isExpanded = ref(props.initialExpanded)
const isMobile = ref(false)
const showChatOnMobile = ref(true)
const showPulse = ref(props.config.showPulse)

// Panel sizing
const contentPanelWidth = ref(280)
const cardWidth = ref(600)
const cardHeight = ref(400)

// Resize state
const isResizing = ref(false)
const isPanelResizing = ref(false)

// Computed properties
const containerClasses = computed(() => ({
  [`widget-position-${props.config.position}`]: true,
  'widget-mobile': isMobile.value,
  'widget-expanded': isExpanded.value,
  'z-50': isExpanded.value,
  'z-40': !isExpanded.value
}))

const minimizedCardClasses = computed(() => ({
  'cursor-pointer': true,
  'hover:shadow-sm': true,
  'transition-all duration-200': true
}))

const minimizedCardStyle = computed(() => ({
  backgroundColor: props.business?.branding?.primaryColor || '#3b82f6'
}))

const expandedCardClasses = computed(() => ({
  [`widget-size-${props.config.size}`]: true,
  'resizing': isResizing.value
}))

const expandedCardStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }

  return {
    width: `${cardWidth.value}px`,
    height: `${cardHeight.value}px`
  }
})

const allowResize = computed(() => props.config.allowResize && !isMobile.value)
const showOverlay = computed(() => props.config.showOverlay && isMobile.value)

// Widget actions
function expandWidget() {
  isExpanded.value = true
  showPulse.value = false
  emit('expanded')

  // Send message to parent for tracking
  window.parent?.postMessage({
    type: 'quantum-chat',
    action: 'widget-expanded',
    business: props.business.name
  }, '*')
}

function minimizeWidget() {
  isExpanded.value = false
  emit('minimized')

  window.parent?.postMessage({
    type: 'quantum-chat',
    action: 'widget-minimized'
  }, '*')
}

function closeWidget() {
  emit('closed')

  window.parent?.postMessage({
    type: 'quantum-chat',
    action: 'widget-closed'
  }, '*')
}

// Resize functionality
function startResize(event: MouseEvent) {
  event.preventDefault()
  isResizing.value = true

  const startX = event.clientX
  const startY = event.clientY
  const startWidth = cardWidth.value
  const startHeight = cardHeight.value

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.value) return

    const newWidth = Math.max(400, Math.min(800, startWidth + (e.clientX - startX)))
    const newHeight = Math.max(300, Math.min(600, startHeight + (e.clientY - startY)))

    cardWidth.value = newWidth
    cardHeight.value = newHeight

    emit('resized', newWidth, newHeight)
  }

  function handleMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function startPanelResize(event: MouseEvent) {
  event.preventDefault()
  isPanelResizing.value = true

  const startX = event.clientX
  const startWidth = contentPanelWidth.value

  function handleMouseMove(e: MouseEvent) {
    if (!isPanelResizing.value) return

    const diff = e.clientX - startX
    const newWidth = Math.max(200, Math.min(400, startWidth + diff))
    contentPanelWidth.value = newWidth
  }

  function handleMouseUp() {
    isPanelResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// Responsive handling
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

function handleResize() {
  checkMobile()

  // Adjust sizes for mobile
  if (isMobile.value) {
    cardHeight.value = Math.min(500, window.innerHeight * 0.8)
  }
}

// Auto expand functionality
function setupAutoExpand() {
  if (props.config.autoExpand && !isExpanded.value) {
    setTimeout(() => {
      if (!isExpanded.value) {
        showPulse.value = true
      }
    }, props.config.expandDelay)
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  handleResize()
  setupAutoExpand()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Watch for business changes
watch(() => props.business, () => {
  // Reset pulse when business changes
  if (props.config.showPulse) {
    showPulse.value = true
  }
})
</script>

<style scoped>
.widget-container {
  position: fixed;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Position classes */
.widget-position-bottom-right {
  bottom: 20px;
  right: 20px;
}

.widget-position-bottom-left {
  bottom: 20px;
  left: 20px;
}

.widget-position-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.widget-position-sidebar-right {
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

.widget-position-sidebar-left {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
}

/* Size classes */
.widget-size-compact {
  width: 400px;
  height: 300px;
}

.widget-size-medium {
  width: 600px;
  height: 400px;
}

.widget-size-large {
  width: 800px;
  height: 500px;
}

/* Mobile adjustments */
.widget-mobile .expanded-card {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  top: auto !important;
  width: 100% !important;
  height: 80vh !important;
  max-height: 500px !important;
  border-radius: 16px 16px 0 0 !important;
}

.widget-mobile .minimized-card {
  bottom: 20px !important;
  right: 20px !important;
  left: auto !important;
  width: 280px !important;
}

/* Card styles - 2025 Flat Design */
.minimized-card {
  position: relative;
  background: #2563eb;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  width: 300px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.card-header {
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-height: 0;
}

.resize-handle {
  user-select: none;
  flex-shrink: 0;
}

/* Animations */
.card-minimize-enter-active,
.card-minimize-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-minimize-enter-from,
.card-minimize-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.card-expand-enter-active,
.card-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-expand-enter-from,
.card-expand-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Hover effects - 2025 Flat Design */
.minimized-card:hover {
  transform: translateY(-1px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .widget-position-bottom-right,
  .widget-position-bottom-left,
  .widget-position-bottom-center {
    bottom: 20px;
    right: 20px;
    left: auto;
  }

  .minimized-card {
    width: 280px !important;
  }
}
</style>