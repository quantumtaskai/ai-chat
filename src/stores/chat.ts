import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { Message, ChatState, AIResponse } from '@/types'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useAppStore } from '@/stores/app'
import { useContentStore } from '@/stores/content'
import { traderService } from '@/services/traderService'
import { openaiService } from '@/services/openaiService'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<Message[]>([])
  const isTyping = ref(false)
  const isListening = ref(false)
  const isMuted = ref(false)
  const sessionId = ref(generateSessionId())
  const isAIInitialized = ref(false)
  const aiError = ref<string | null>(null)

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

    try {
      // Initialize OpenAI service if not already done
      if (!isAIInitialized.value && !aiError.value) {
        console.log('Initializing OpenAI service...')
        const initialized = await openaiService.initialize()
        isAIInitialized.value = initialized
        if (!initialized) {
          aiError.value = 'OpenAI service initialization failed'
        }
      }

      // Check for trader-related queries FIRST (preserve existing business logic)
      if (traderService.isTraderQuery(message)) {
        console.log(`Detected trader query: "${message}"`)

        try {
          const searchQuery = traderService.parseQuery(message)
          console.log('Parsed search query:', searchQuery)

          const searchResults = traderService.searchTraders(searchQuery)
          console.log('Search results:', searchResults.totalCount, 'traders found')

          const response = traderService.generateTraderResponse(searchResults, searchQuery)

          // Show trader search results in content panel
          if (searchResults.traders.length > 0) {
            contentStore.showTraderSearchResults(searchResults, searchQuery, response)
          }

          return {
            message: response,
            suggestedContent: searchResults.traders.length > 0 ? ['trader-search-results'] : [],
            intent: 'trader_discovery',
            confidence: 0.9
          }
        } catch (error) {
          console.error('Error processing trader query:', error)
          return {
            message: "I'm having trouble searching our trader network right now. Please try again.",
            suggestedContent: [],
            intent: 'trader_error',
            confidence: 0.3
          }
        }
      }

      // Search knowledge base for relevant context
      const knowledgeResults = business ? knowledgeStore.searchKnowledge(message) : []
      console.log(`Knowledge search results:`, knowledgeResults)

      // If OpenAI is available, use it for intelligent responses
      if (isAIInitialized.value && openaiService.isAvailable()) {
        console.log('Using OpenAI for response generation...')

        const conversationContext = {
          messages: messages.value,
          businessContext: business,
          sessionId: sessionId.value
        }

        const aiResponse = await openaiService.generateResponse(message, conversationContext, knowledgeResults)

        // Handle function calls (like trader search)
        if (aiResponse.functionCall?.name === 'search_traders') {
          const searchArgs = aiResponse.functionCall.arguments
          const searchResults = traderService.searchTraders(searchArgs)

          if (searchResults.traders.length > 0) {
            const traderResponse = traderService.generateTraderResponse(searchResults, searchArgs)
            contentStore.showTraderSearchResults(searchResults, searchArgs, traderResponse)

            return {
              message: traderResponse,
              suggestedContent: ['trader-search-results'],
              intent: 'trader_discovery',
              confidence: 0.9
            }
          }
        }

        console.log('OpenAI response:', aiResponse)
        return aiResponse

      } else {
        console.log('OpenAI not available, using fallback knowledge base responses...')

        // Fallback to knowledge base if OpenAI is not available
        if (knowledgeResults.length > 0) {
          const bestMatch = knowledgeResults[0]
          return {
            message: bestMatch.answer,
            suggestedContent: bestMatch.contentIds || [],
            intent: 'knowledge_base',
            confidence: 0.8
          }
        }

        // Ultimate fallback with business context
        const businessName = business?.name || 'our company'
        return {
          message: `I'm here to help you learn about ${businessName}! You can ask me about our services, pricing, hours, location, or how to get in touch with us.`,
          suggestedContent: [],
          intent: 'general_help',
          confidence: 0.5
        }
      }

    } catch (error) {
      console.error('Error in AI service:', error)
      aiError.value = error instanceof Error ? error.message : 'Unknown AI error'

      // Fallback to knowledge base on error
      const knowledgeResults = business ? knowledgeStore.searchKnowledge(message) : []
      if (knowledgeResults.length > 0) {
        const bestMatch = knowledgeResults[0]
        return {
          message: bestMatch.answer,
          suggestedContent: bestMatch.contentIds || [],
          intent: 'knowledge_base',
          confidence: 0.7
        }
      }

      // Final error fallback
      const businessName = business?.name || 'our team'
      return {
        message: `I'm currently having trouble processing your request. Please contact ${businessName} directly for assistance, or try again in a moment.`,
        suggestedContent: ['contact-form'],
        intent: 'error_fallback',
        confidence: 0.3,
        error: aiError.value
      }
    }
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
    isAIInitialized,
    aiError,
    
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