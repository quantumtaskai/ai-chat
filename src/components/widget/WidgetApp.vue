<template>
  <div id="widget-app" class="h-screen w-full bg-transparent">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-full bg-transparent">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600 text-sm">Loading AI Receptionist...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-full bg-transparent p-4">
      <div class="text-center max-w-sm">
        <div class="text-red-500 mb-3">
          <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Unable to Load Widget</h2>
        <p class="text-gray-600 text-sm mb-4">{{ error }}</p>
        <button
          @click="initialize"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Simple Widget (new clean version) -->
    <SimpleWidget
      v-else-if="business && isSimpleMode"
      :business="business"
      :auto-expand="urlParams.auto || urlParams.expanded"
    />

    <!-- Complex Widget Container (original) -->
    <WidgetContainer
      v-else-if="business"
      :business="business"
      :config="widgetConfig"
      :initial-expanded="initialExpanded"
      @expanded="handleExpanded"
      @minimized="handleMinimized"
      @closed="handleClosed"
      @resized="handleResized"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useChatStore } from '@/stores/chat'
import type { BusinessConfig } from '@/types'
import type { WidgetConfig } from './WidgetContainer.vue'
import WidgetContainer from './WidgetContainer.vue'
import SimpleWidget from './SimpleWidget.vue'

// Stores
const appStore = useAppStore()
const chatStore = useChatStore()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const business = ref<BusinessConfig | null>(null)
const widgetConfig = ref<WidgetConfig>({})
const initialExpanded = ref(false)

// Parse URL parameters for widget configuration
const urlParams = computed(() => {
  const params = new URLSearchParams(window.location.search)
  return {
    mode: params.get('mode'), // 'simple' or default
    auto: params.get('auto') === 'true', // Auto-load mode
    businessId: params.get('businessId') || 'demo', // Default to demo
    apiUrl: params.get('apiUrl'),
    position: params.get('position') as WidgetConfig['position'] || 'bottom-right',
    size: params.get('size') as WidgetConfig['size'] || 'medium',
    allowResize: params.get('allowResize') !== 'false',
    showPulse: params.get('showPulse') !== 'false',
    showOverlay: params.get('showOverlay') !== 'false',
    autoExpand: params.get('autoExpand') === 'true',
    expandDelay: parseInt(params.get('expandDelay') || '3000'),
    primaryColor: params.get('primaryColor'),
    secondaryColor: params.get('secondaryColor'),
    parentDomain: params.get('parentDomain'),
    expanded: params.get('expanded') === 'true'
  }
})

// Check if we're in simple mode
const isSimpleMode = computed(() => {
  return urlParams.value.mode === 'simple' || urlParams.value.auto
})

// Initialize widget
async function initialize() {
  try {
    isLoading.value = true
    error.value = null

    // Validate parent domain for security
    if (urlParams.value.parentDomain && window.parent !== window) {
      const allowedOrigin = urlParams.value.parentDomain

      // Send ready message to parent
      window.parent.postMessage({
        type: 'quantum-chat',
        action: 'widget-ready'
      }, allowedOrigin)
    }

    // Load business configuration
    await loadBusinessConfig()

    // Apply custom branding if provided
    applyCustomBranding()

    // Configure widget
    widgetConfig.value = {
      position: urlParams.value.position,
      size: urlParams.value.size,
      allowResize: urlParams.value.allowResize,
      showPulse: urlParams.value.showPulse,
      showOverlay: urlParams.value.showOverlay,
      autoExpand: urlParams.value.autoExpand,
      expandDelay: urlParams.value.expandDelay
    }

    // Set initial expanded state
    initialExpanded.value = urlParams.value.expanded

    // Initialize chat with welcome message
    if (business.value) {
      chatStore.addWelcomeMessage(business.value.settings?.welcomeMessage || 'Hello! How can I help you today?')
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to initialize widget'
    console.error('Widget initialization error:', err)
  } finally {
    isLoading.value = false
  }
}

// Load business configuration
async function loadBusinessConfig() {
  try {
    // If API URL is provided, use it
    if (urlParams.value.apiUrl) {
      const response = await fetch(`${urlParams.value.apiUrl}/business/${urlParams.value.businessId || 'default'}`)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      business.value = await response.json()
      return
    }

    // If business ID is provided, try to load from app store
    if (urlParams.value.businessId) {
      // This would typically load from a business registry
      // For now, fall back to default business config
      await appStore.loadBusinessConfig()
      business.value = appStore.currentBusiness
      return
    }

    // Fall back to app store default
    await appStore.loadBusinessConfig()
    business.value = appStore.currentBusiness

    if (!business.value) {
      throw new Error('No business configuration found')
    }
  } catch (err) {
    throw new Error(`Failed to load business configuration: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

// Apply custom branding
function applyCustomBranding() {
  if (!business.value) return

  // Apply custom colors if provided
  if (urlParams.value.primaryColor) {
    business.value.branding.primaryColor = urlParams.value.primaryColor
  }
  if (urlParams.value.secondaryColor) {
    business.value.branding.secondaryColor = urlParams.value.secondaryColor
  }

  // Apply CSS custom properties for dynamic theming
  const root = document.documentElement
  root.style.setProperty('--primary-color', business.value.branding.primaryColor)
  root.style.setProperty('--secondary-color', business.value.branding.secondaryColor)
}

// Event handlers
function handleExpanded() {
  sendMessageToParent('widget-expanded', {
    business: business.value?.name
  })
}

function handleMinimized() {
  sendMessageToParent('widget-minimized')
}

function handleClosed() {
  sendMessageToParent('widget-closed')
}

function handleResized(width: number, height: number) {
  sendMessageToParent('widget-resized', { width, height })
}

// Send message to parent window
function sendMessageToParent(action: string, data: any = {}) {
  if (window.parent !== window && urlParams.value.parentDomain) {
    window.parent.postMessage({
      type: 'quantum-chat',
      action,
      ...data
    }, urlParams.value.parentDomain)
  }
}

// Lifecycle
onMounted(() => {
  initialize()
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

#widget-app {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Ensure transparent background for widget mode */
body, html {
  background: transparent !important;
}

/* Remove any default styling that might create boxes */
*, *::before, *::after {
  background: inherit;
}

#app, #widget-app {
  background: transparent !important;
}
</style>