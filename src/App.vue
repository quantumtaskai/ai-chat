<template>
  <div id="app" class="font-sans antialiased bg-transparent gpu-accelerated">
    <!-- Widget Mode -->
    <Suspense v-if="isWidgetMode">
      <WidgetApp />
      <template #fallback>
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Loading widget...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- Main Receptionist Interface -->
    <Suspense v-else-if="!appStore.isLoading && appStore.currentBusiness">
      <ReceptionistApp :business="appStore.currentBusiness" />
      <template #fallback>
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
          <div class="text-center">
            <div class="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-700 font-medium">Loading application...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- Loading State -->
    <div v-else-if="appStore.isLoading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div class="text-center glass-morphism p-8 rounded-2xl shadow-glass border border-white/20 backdrop-blur-md animate-scale-in">
        <div class="glass-spinner mx-auto mb-6"></div>
        <p class="text-gray-700 font-semibold text-lg">Loading AI Receptionist...</p>
        <div class="mt-4 w-32 h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="appStore.error" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div class="text-center max-w-md glass-morphism p-8 rounded-2xl shadow-glass border border-white/20 backdrop-blur-md animate-scale-in">
        <div class="text-red-500 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
        <p class="text-gray-600 mb-6 font-medium">{{ appStore.error }}</p>
        <button
          @click="appStore.initialize()"
          class="btn-primary ripple"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- No Business Configuration -->
    <div v-else class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div class="text-center max-w-md glass-morphism p-8 rounded-2xl shadow-glass border border-white/20 backdrop-blur-md animate-scale-in">
        <div class="text-gray-400 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Business Not Found</h2>
        <p class="text-gray-600 font-medium">Please check the URL or contact support.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, defineAsyncComponent } from 'vue'
import { useAppStore } from '@/stores/app'

// Lazy-loaded main components for better code splitting
const ReceptionistApp = defineAsyncComponent(() => import('@/components/layout/ReceptionistApp.vue'))
const WidgetApp = defineAsyncComponent(() => import('@/components/widget/WidgetApp.vue'))

const appStore = useAppStore()

// Check if we're in widget mode based on URL path
const isWidgetMode = computed(() => {
  return window.location.pathname === '/widget' || window.location.pathname.startsWith('/widget/')
})

onMounted(() => {
  // Only initialize app store for main app, not widget mode
  if (!isWidgetMode.value) {
    appStore.initialize()
  }
})
</script>

<style>
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
</style>