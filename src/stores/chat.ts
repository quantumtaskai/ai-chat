import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ChatState, AIResponse } from '@/types'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useAppStore } from '@/stores/app'
import { useContentStore } from '@/stores/content'
import { traderService } from '@/services/traderService'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<Message[]>([])
  const isTyping = ref(false)
  const isListening = ref(false)
  const isMuted = ref(false)
  const sessionId = ref(generateSessionId())

  // Getters
  const chatState = computed<ChatState>(() => ({
    messages: messages.value,
    isTyping: isTyping.value,
    isListening: isListening.value,
    isMuted: isMuted.value,
    currentContent: null,
    sessionId: sessionId.value
  }))

  const lastMessage = computed(() => {
    return messages.value[messages.value.length - 1] || null
  })

  const userMessages = computed(() => {
    return messages.value.filter(m => m.role === 'user')
  })

  const assistantMessages = computed(() => {
    return messages.value.filter(m => m.role === 'assistant')
  })

  // Helper functions (currently unused but may be useful later)

  // Actions
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  function addMessage(content: string, role: 'user' | 'assistant' | 'system', contentType?: string) {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content,
      role,
      timestamp: new Date(),
      contentType
    }

    messages.value.push(message)

    // Memory management: Keep only last 100 messages to prevent memory leaks
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(-100)
    }

    return message
  }

  function addWelcomeMessage(welcomeText: string) {
    if (messages.value.length === 0) {
      addMessage(welcomeText, 'assistant')
    }
  }

  async function sendMessage(content: string): Promise<void> {
    // Add user message
    addMessage(content, 'user')

    // Set typing indicator
    isTyping.value = true

    try {
      // Call AI service
      const response = await callAIService(content)

      // Add AI response
      addMessage(response.message, 'assistant')

      // Handle content suggestions
      if (response.suggestedContent && response.suggestedContent.length > 0) {
        console.log('Chat: Suggesting content:', response.suggestedContent)
        // Emit event for content panel to show suggested content
        window.dispatchEvent(new CustomEvent('ai-suggest-content', {
          detail: {
            contentIds: response.suggestedContent,
            intent: response.intent
          }
        }))
      } else {
        console.log('Chat: No content suggestions to display')
      }

    } catch (error) {
      console.error('Failed to get AI response:', error)
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant')
    } finally {
      isTyping.value = false
    }
  }

  async function callAIService(message: string): Promise<AIResponse> {
    const knowledgeStore = useKnowledgeStore()
    const appStore = useAppStore()
    const contentStore = useContentStore()
    const business = appStore.currentBusiness
    const lowerMessage = message.toLowerCase()

    return new Promise((resolve) => {
      setTimeout(() => {
        let response = ''
        let suggestedContent: string[] = []
        let intent = 'general_inquiry'
        let confidence = 0.7

        // Check for meeting/scheduling queries FIRST
        if (lowerMessage.includes('schedule') || lowerMessage.includes('meeting') || lowerMessage.includes('appointment') ||
            lowerMessage.includes('book') || lowerMessage.includes('consultation') || lowerMessage.includes('meet') ||
            lowerMessage.includes('calendar') || lowerMessage.includes('available') && (lowerMessage.includes('time') || lowerMessage.includes('when'))) {
          response = 'I can help you schedule a business meeting with our trade experts. We offer consultations for product sourcing, export/import strategy, market entry discussions, and partnership opportunities.'
          intent = 'meeting_inquiry'
          suggestedContent = ['schedule-meeting']
          confidence = 0.95
          console.log('Meeting/scheduling intent detected directly')
        }
        // Check for trader-related queries SECOND (before knowledge base)
        else if (traderService.isTraderQuery(message)) {
          console.log(`Detected trader query: "${message}"`)

          try {
            const searchQuery = traderService.parseQuery(message)
            console.log('Parsed search query:', searchQuery)

            const searchResults = traderService.searchTraders(searchQuery)
            console.log('Search results:', searchResults.totalCount, 'traders found')

            response = traderService.generateTraderResponse(searchResults, searchQuery)
            intent = 'trader_discovery'
            confidence = 0.9

            // Show trader search results in left panel
            if (searchResults.traders.length > 0) {
              // Directly show the search results using content store
              contentStore.showTraderSearchResults(searchResults, searchQuery, response)

              // Still emit content suggestion for the event system
              suggestedContent = ['trader-search-results']

              console.log('Directly updated content store with new trader search results')
            }
          } catch (error) {
            console.error('Error processing trader query:', error)
            response = "I'm having trouble searching our trader network right now. Please try again."
            intent = 'trader_error'
            confidence = 0.3
          }
        }

        // Check for company/about queries specifically
        else if (lowerMessage.includes('about') && (lowerMessage.includes('far') || lowerMessage.includes('company') || lowerMessage.includes('farway'))) {
          response = 'Far Way Company is a trusted FMCG trading partner with over 23 years of experience. We operate in 40+ countries and maintain the highest quality standards through our HACCP-certified facilities.'
          intent = 'company_inquiry'
          suggestedContent = ['company-overview']
          confidence = 0.95
          console.log('Company/about intent detected directly')
        }
        // Check for product/category queries specifically
        else if (lowerMessage.includes('product') || lowerMessage.includes('categor') || lowerMessage.includes('what do you sell') || lowerMessage.includes('beverage') || lowerMessage.includes('snack') || lowerMessage.includes('confection')) {
          response = 'We handle a wide range of FMCG categories: Beverages, Confectionaries, Snacks, Cleaning & Household products, Personal Care items, and Beauty Equipment. Each category includes hundreds of international brands.'
          intent = 'product_inquiry'
          suggestedContent = ['product-categories']
          confidence = 0.95
          console.log('Product/categories intent detected directly')
        }

        // Search knowledge base (only if no other response)
        if (!response && business) {
          console.log(`Searching knowledge for message: "${message}"`)
          const knowledgeResults = knowledgeStore.searchKnowledge(message)
          console.log(`Knowledge search results:`, knowledgeResults)

          if (knowledgeResults.length > 0) {
            const bestMatch = knowledgeResults[0]

            // Use knowledge base answer directly (it's already well-formatted)
            response = bestMatch.answer
            intent = 'knowledge_base'
            confidence = 0.9

            // Suggest content from knowledge base if available
            if (bestMatch.contentIds && bestMatch.contentIds.length > 0) {
              suggestedContent = bestMatch.contentIds
              console.log(`Suggesting content from knowledge base:`, suggestedContent)
            }
          }
        }


        // Fallback to pattern-based responses if no knowledge found
        if (!response) {
          console.log(`No knowledge base response found, using pattern-based responses for: "${lowerMessage}"`)
          if (lowerMessage.includes('service') || lowerMessage.includes('what do you do') || lowerMessage.includes('product') || lowerMessage.includes('trade')) {
            response = 'Far Way Company is a leading FMCG import, export, and distribution company. We specialize in beverages, confectionaries, snacks, cleaning & household products, personal care, and beauty equipment. We operate in 40+ countries and work with 500+ global brands.'
            intent = 'services_inquiry'
            suggestedContent = ['product-categories']
            confidence = 0.8

          } else if (lowerMessage.includes('company') || lowerMessage.includes('business') || lowerMessage.includes('about') || lowerMessage.includes('who are you') || lowerMessage.includes('tell me') && lowerMessage.includes('far')) {
            response = 'Far Way Company is a trusted FMCG trading partner established in 2001 with over 23 years of experience. We operate in 40+ countries and maintain the highest quality standards through our HACCP-certified facilities.'
            intent = 'company_overview'
            suggestedContent = ['company-overview']
            confidence = 0.9
            
          } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
            response = 'Our pricing varies by product category, quantity, and destination. We work with competitive rates for FMCG import/export. For detailed pricing information, please contact us with your specific requirements including product type, quantity, and destination country.'
            intent = 'pricing_inquiry'
            suggestedContent = ['business-inquiry-form']
            confidence = 0.8
            
          } else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
            response = 'We\'re available for business inquiries Monday to Friday 9:00 AM - 6:00 PM, Saturday 10:00 AM - 3:00 PM (Dubai time). Sunday we\'re closed.'
            intent = 'hours_inquiry'
            confidence = 0.9
            
          } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
            response = 'You can reach us through multiple channels: WhatsApp at +971 52 76 76 100, email at contact@farwaycompany.com, or fill out our business inquiry form. We\'re based in Dubai, UAE and are available during business hours.'
            intent = 'contact_inquiry'
            suggestedContent = ['business-inquiry-form']
            confidence = 0.9
            
          } else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
            response = 'We\'re located at Office No. 507, New Century City Tower, Deira, Dubai, UAE. You can reach us via WhatsApp at +971 52 76 76 100 or email at contact@farwaycompany.com.'
            intent = 'location_inquiry'
            confidence = 0.9
            
          } else if (lowerMessage.includes('demo') || lowerMessage.includes('show') || lowerMessage.includes('see')) {
            response = 'I can show you information about our product categories and global trading network!'
            intent = 'demo_inquiry'
            suggestedContent = ['product-categories'] // Suggest product categories
            confidence = 0.8

          } else {
            // Generic response with business context
            const businessName = business?.name || 'our company'
            response = `I'm here to help you learn about ${businessName}! You can ask me about our services, pricing, hours, location, or how to get in touch with us.`
            intent = 'general_help'
            confidence = 0.5
          }
        }

        console.log(`Final AI response:`, {
          message: response,
          suggestedContent,
          intent,
          confidence
        })
        
        resolve({
          message: response,
          suggestedContent,
          intent,
          confidence
        })
      }, 500 + Math.random() * 800) // Simulate processing time
    })
  }

  function setTyping(typing: boolean) {
    isTyping.value = typing
  }

  function setListening(listening: boolean) {
    isListening.value = listening
  }

  function setMuted(muted: boolean) {
    isMuted.value = muted
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    return isMuted.value
  }

  function clearMessages() {
    messages.value = []
  }

  function getConversationContext(): string {
    return messages.value
      .slice(-10) // Last 10 messages for context
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
  }

  return {
    // State
    messages,
    isTyping,
    isListening,
    isMuted,
    sessionId,
    
    // Getters
    chatState,
    lastMessage,
    userMessages,
    assistantMessages,
    
    // Actions
    addMessage,
    addWelcomeMessage,
    sendMessage,
    setTyping,
    setListening,
    setMuted,
    toggleMute,
    clearMessages,
    getConversationContext
  }
})