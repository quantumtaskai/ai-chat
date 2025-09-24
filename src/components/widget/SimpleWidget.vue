<template>
  <div class="simple-widget">
    <!-- Minimized Card -->
    <div
      v-if="!isExpanded"
      class="minimized-card"
      @click="expandWidget"
    >
      <div class="card-content">
        <div class="chat-icon">
          <!-- Modern AI Assistant Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div class="card-text">
          <div class="business-name">{{ business?.name || 'AI Assistant' }}</div>
          <div class="chat-prompt">Need help? Click to chat</div>
        </div>
      </div>

      <!-- Pulse indicator -->
      <div class="pulse-dot"></div>
    </div>

    <!-- Popup Overlay -->
    <div
      v-if="isExpanded"
      class="popup-overlay"
      @click="minimizeWidget"
    >
      <!-- Expanded Card -->
      <div
        class="expanded-card"
        @click.stop
      >
      <!-- Header -->
      <div class="card-header">
        <div class="header-content">
          <div class="header-icon">
            <!-- Modern AI Assistant Icon -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="header-text">
            <div class="business-name">{{ business?.name || 'AI Assistant' }}</div>
            <div class="status-text">Online</div>
          </div>
        </div>

        <button class="minimize-btn" @click="minimizeWidget">
          <!-- Modern Minimize Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
          </svg>
        </button>
      </div>

      <!-- Content Area -->
      <div class="card-body">
        <!-- Mobile: Single panel with toggle -->
        <div v-if="isMobile" class="mobile-content">
          <!-- Content Panel -->
          <div v-if="!showChat" class="content-section">
            <ContentPanel :business="business" />
          </div>

          <!-- Chat Panel -->
          <div v-if="showChat" class="chat-section">
            <ChatPanel
              :business="business"
              @chat-started="onChatStarted"
              @input-focus="onInputFocus"
            />
          </div>

          <!-- Mobile Toggle -->
          <div class="mobile-toggle">
            <button
              :class="{ active: !showChat }"
              @click="showChat = false"
            >
              Info
            </button>
            <button
              :class="{ active: showChat }"
              @click="showChat = true"
            >
              Chat
            </button>
          </div>
        </div>

        <!-- Desktop: Side by side -->
        <div v-else class="desktop-content">
          <div class="content-panel">
            <ContentPanel :business="business" />
          </div>
          <div class="chat-panel">
            <ChatPanel
              :business="business"
              @chat-started="onChatStarted"
              @input-focus="onInputFocus"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { BusinessConfig } from '@/types'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import ContentPanel from '@/components/content/ContentPanel.vue'

interface Props {
  business: BusinessConfig
  autoExpand?: boolean
}

const props = defineProps<Props>()

// Simple state - start expanded if autoExpand is true
const isExpanded = ref(props.autoExpand || false)
const isMobile = ref(false)
const showChat = ref(true)

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Widget actions
const expandWidget = () => {
  isExpanded.value = true

  // Send message to parent
  window.parent?.postMessage({
    type: 'quantum-chat',
    action: 'widget-expanded'
  }, '*')
}

const minimizeWidget = () => {
  isExpanded.value = false

  window.parent?.postMessage({
    type: 'quantum-chat',
    action: 'widget-minimized'
  }, '*')
}

// Chat event handlers
const onChatStarted = () => {
  // Auto-expand when user starts chatting
  if (!isExpanded.value) {
    expandWidget()
  }

  // On mobile, switch to chat view
  if (isMobile.value) {
    showChat.value = true
  }
}

const onInputFocus = () => {
  // Auto-expand on input focus
  if (!isExpanded.value) {
    expandWidget()
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style scoped>
.simple-widget {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif;
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Minimized Card - Modern 2025 Design */
.minimized-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 35%, #7c3aed 100%);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  cursor: pointer;
  transition: all 0.25s ease;
  width: 280px;
  backdrop-filter: blur(8px);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

.minimized-card:hover {
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.2);
}

.minimized-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  border-radius: 20px;
  pointer-events: none;
}


.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  z-index: 1;
  position: relative;
}

.chat-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.minimized-card:hover .chat-icon {
  transform: scale(1.05);
}

.chat-icon svg {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-text {
  flex: 1;
  color: white;
  line-height: 1.4;
}

.business-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 4px;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  font-feature-settings: 'ss01', 'ss02';
}

.chat-prompt {
  font-size: 13px;
  opacity: 0.92;
  font-weight: 450;
  line-height: 1.35;
  letter-spacing: -0.005em;
  text-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.06);
}

.pulse-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  animation: simplePulse 2s infinite ease-in-out;
  z-index: 2;
}

.pulse-dot::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(52, 211, 153, 0.1) 100%);
  border-radius: 50%;
  animation: pulseRing 2.5s infinite ease-in-out;
}

@keyframes simplePulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Popup Overlay */
.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999998;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

/* Expanded Card - Modern Popup Design */
.expanded-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.08),
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 8px 20px rgba(0, 0, 0, 0.03);
  width: 90vw;
  height: 85vh;
  max-width: 1400px;
  min-width: 1000px;
  max-height: 900px;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: expandPopup 0.3s ease-out;
  position: relative;
}

@keyframes expandPopup {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
}

/* Header - Enhanced Modern Design */
.card-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 35%, #7c3aed 100%);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 16px;
  height: 16px;
}

.header-text .business-name {
  font-size: 15px;
  font-weight: 550;
  margin-bottom: 1px;
  letter-spacing: -0.01em;
  font-feature-settings: 'ss01';
}

.status-text {
  font-size: 11px;
  opacity: 0.85;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.minimize-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.minimize-btn svg {
  width: 16px;
  height: 16px;
}

/* Body */
.card-body {
  flex: 1;
  overflow: hidden;
}

/* Desktop Content */
.desktop-content {
  display: flex;
  height: 100%;
  gap: 0;
}

.content-panel {
  flex: 0 0 65%;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
}

.chat-panel {
  flex: 0 0 35%;
  background: rgba(249, 250, 251, 0.9);
}

/* Mobile Content */
.mobile-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-section,
.chat-section {
  flex: 1;
  overflow-y: auto;
}

.chat-section {
  background: rgba(249, 250, 251, 0.9);
}

.mobile-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
}

.mobile-toggle button {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-toggle button.active {
  color: #3b82f6;
  background: #eff6ff;
}

/* Mobile Responsive - Enhanced */
@media (max-width: 768px) {
  .minimized-card {
    bottom: 20px;
    right: 20px;
    left: 20px;
    width: 260px;
    max-width: 260px;
    margin-left: auto;
    height: 160px;
    min-width: 260px;
  }

  .card-content {
    gap: 16px;
  }

  .chat-icon {
    width: 44px;
    height: 44px;
  }

  .chat-icon svg {
    width: 22px;
    height: 22px;
  }

  .business-name {
    font-size: 15px;
    font-weight: 600;
  }

  .chat-prompt {
    font-size: 12px;
    font-weight: 450;
  }

  .expanded-card {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 5%;
    width: 100vw;
    height: 95vh;
    border-radius: 16px 16px 0 0;
    max-height: none;
    animation: expandCardMobile 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card-header {
    padding: 16px 20px;
  }

  .desktop-content {
    flex-direction: column;
  }

  .content-panel {
    width: 100%;
    border-right: none;
    height: 35%;
  }

  .chat-panel {
    height: 65%;
  }

  @keyframes expandCardMobile {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>