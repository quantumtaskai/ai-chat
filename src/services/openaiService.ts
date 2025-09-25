import OpenAI from 'openai'
import type { BusinessConfig, Message, AIResponse } from '@/types'

interface OpenAIConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  streamingEnabled?: boolean
}

interface ConversationContext {
  messages: Message[]
  businessContext: BusinessConfig | null
  sessionId: string
}

export class OpenAIService {
  private client: OpenAI | null = null
  private config: OpenAIConfig
  private isInitialized = false
  private responseCache = new Map<string, { response: AIResponse; timestamp: number }>()
  private apiCallCount = 0
  private localResponseCount = 0
  private cachedResponseCount = 0

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
      streamingEnabled: true
    }
  }

  /**
   * Initialize OpenAI client with API key validation
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY environment variable.')
        return false
      }

      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      })

      // Test the connection
      await this.testConnection()
      this.isInitialized = true
      console.log('OpenAI service initialized successfully')
      return true

    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error)
      this.isInitialized = false
      return false
    }
  }

  /**
   * Test OpenAI API connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) throw new Error('OpenAI client not initialized')

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      })

      if (!response.choices[0]?.message) {
        throw new Error('Invalid API response')
      }
    } catch (error) {
      throw new Error(`OpenAI API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate AI response with business context
   */
  async generateResponse(
    userMessage: string,
    context: ConversationContext,
    knowledgeBaseResults: any[] = []
  ): Promise<AIResponse> {
    try {
      if (!this.isInitialized || !this.client) {
        throw new Error('OpenAI service not initialized')
      }

      // Cost optimization: Check for simple patterns that don't need AI
      const localResponse = this.tryLocalResponse(userMessage, context.businessContext)
      if (localResponse) {
        this.localResponseCount++
        console.log('Using local response to save API costs:', userMessage)
        return localResponse
      }

      // Check cache for recent similar responses (within 10 minutes)
      const cacheKey = this.generateCacheKey(userMessage, context.businessContext)
      const cachedResponse = this.getCachedResponse(cacheKey)
      if (cachedResponse) {
        this.cachedResponseCount++
        console.log('Using cached response to save API costs:', userMessage)
        return cachedResponse
      }

      // Build system prompt with business context
      const systemPrompt = this.buildSystemPrompt(context.businessContext, knowledgeBaseResults)

      // Prepare conversation messages
      const messages = this.prepareMessages(systemPrompt, context.messages, userMessage)

      // Get AI response
      const completion = await this.client.chat.completions.create({
        model: this.config.model!,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        functions: this.getFunctionDefinitions(),
        function_call: 'auto'
      })

      const assistantMessage = completion.choices[0]?.message
      if (!assistantMessage) {
        throw new Error('No response from OpenAI')
      }

      // Track API call
      this.apiCallCount++
      console.log(`OpenAI API call #${this.apiCallCount} for: "${userMessage}"`)

      // Process function calls if present
      if (assistantMessage.function_call) {
        const result = await this.processFunctionCall(assistantMessage.function_call, context)
        this.setCachedResponse(cacheKey, result)
        return result
      }

      // Regular text response
      const result = this.processTextResponse(assistantMessage.content || '', context)
      this.setCachedResponse(cacheKey, result)
      return result

    } catch (error) {
      console.error('OpenAI API error:', error)

      // Return error response with fallback
      return {
        message: this.getErrorFallbackMessage(userMessage, context.businessContext),
        suggestedContent: [],
        intent: 'error',
        confidence: 0.1,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Try to provide local responses for simple queries to save API costs
   */
  private tryLocalResponse(userMessage: string, business: BusinessConfig | null): AIResponse | null {
    const message = userMessage.toLowerCase().trim()
    const businessName = business?.name || 'our business'

    // Greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
    if (greetings.some(greeting => message === greeting || message.startsWith(greeting + ' ') || message.startsWith(greeting + ','))) {
      const responses = [
        `Hello! Welcome to ${businessName}. How can I help you today?`,
        `Hi there! I'm here to help you learn about ${businessName}. What would you like to know?`,
        `Welcome to ${businessName}! I'm your AI assistant. How may I assist you today?`
      ]
      return {
        message: responses[Math.floor(Math.random() * responses.length)],
        suggestedContent: ['company-overview'],
        intent: 'greeting',
        confidence: 0.9
      }
    }

    // Thanks/appreciation
    const thanks = ['thank you', 'thanks', 'thank u', 'thx', 'ty', 'appreciate', 'awesome', 'great', 'perfect']
    if (thanks.some(thank => message.includes(thank))) {
      const responses = [
        `You're welcome! Is there anything else I can help you with about ${businessName}?`,
        `Happy to help! Feel free to ask if you need more information about our services.`,
        `Glad I could assist! Let me know if you have any other questions.`
      ]
      return {
        message: responses[Math.floor(Math.random() * responses.length)],
        suggestedContent: ['contact-form'],
        intent: 'appreciation',
        confidence: 0.8
      }
    }

    // Simple questions about hours
    if (message.includes('open') || message.includes('hours') || message.includes('close')) {
      if (business?.settings?.operatingHours?.enabled) {
        const hours = business.settings.operatingHours.hours
        if (hours) {
          let hoursText = `Here are our operating hours:\n`
          Object.entries(hours).forEach(([day, schedule]: [string, any]) => {
            const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
            const timeInfo = schedule.open === 'closed' ? 'Closed' : `${schedule.open} - ${schedule.close}`
            hoursText += `• ${dayCapitalized}: ${timeInfo}\n`
          })
          return {
            message: hoursText.trim(),
            suggestedContent: ['contact-form'],
            intent: 'hours_inquiry',
            confidence: 0.9
          }
        }
      }
      return {
        message: `Please contact ${businessName} directly for our current operating hours.`,
        suggestedContent: ['contact-form'],
        intent: 'hours_inquiry',
        confidence: 0.7
      }
    }

    // Contact information queries
    if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('address')) {
      const phone = business?.phone || business?.settings?.contactInfo?.phone
      const email = business?.email || business?.settings?.contactInfo?.email
      const address = business?.address || business?.settings?.contactInfo?.address

      let contactText = `Here's how you can reach ${businessName}:\n`
      if (phone) contactText += `📞 Phone: ${phone}\n`
      if (email) contactText += `📧 Email: ${email}\n`
      if (address) contactText += `📍 Address: ${address}\n`

      if (!phone && !email && !address) {
        contactText = `Please use our contact form to get in touch with ${businessName}.`
      }

      return {
        message: contactText.trim(),
        suggestedContent: ['contact-form'],
        intent: 'contact_inquiry',
        confidence: 0.9
      }
    }

    return null // No local response available, use AI
  }

  /**
   * Generate cache key for response caching
   */
  private generateCacheKey(userMessage: string, business: BusinessConfig | null): string {
    const businessId = business?.id || 'default'
    const messageHash = userMessage.toLowerCase().trim().replace(/\s+/g, ' ')
    return `${businessId}:${messageHash}`
  }

  /**
   * Get cached response if available and not expired (10 minutes)
   */
  private getCachedResponse(cacheKey: string): AIResponse | null {
    const cached = this.responseCache.get(cacheKey)
    if (!cached) return null

    const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION

    if (isExpired) {
      this.responseCache.delete(cacheKey)
      return null
    }

    return cached.response
  }

  /**
   * Cache a response for future use
   */
  private setCachedResponse(cacheKey: string, response: AIResponse): void {
    // Limit cache size to prevent memory issues
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value
      this.responseCache.delete(firstKey)
    }

    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    })
  }

  /**
   * Build system prompt with business context
   */
  private buildSystemPrompt(business: BusinessConfig | null, knowledgeResults: any[] = []): string {
    if (!business) {
      return 'You are a helpful AI assistant. Provide clear and useful responses to user inquiries.'
    }

    const businessName = business.name || 'this business'
    const businessDescription = business.description || 'a professional service provider'
    const industry = business.industry || 'service industry'
    const personality = business.settings?.aiPersonality || 'friendly and professional'

    let systemPrompt = `You are an AI assistant for ${businessName}, representing a ${industry} business.

BUSINESS PROFILE:
${businessDescription}

PERSONALITY: Be ${personality} in all interactions.

CORE RESPONSIBILITIES:
1. Answer questions about the business accurately
2. Help customers find what they need
3. Guide users to take appropriate actions
4. Suggest relevant resources when helpful
5. Qualify potential leads professionally

BUSINESS DETAILS:`

    // Add core business information
    if (business.tagline) {
      systemPrompt += `\n• Tagline: ${business.tagline}`
    }
    if (business.founded) {
      systemPrompt += `\n• Founded: ${business.founded}`
    }
    if (business.mission) {
      systemPrompt += `\n• Mission: ${business.mission}`
    }
    if (business.vision) {
      systemPrompt += `\n• Vision: ${business.vision}`
    }
    if (business.certification) {
      systemPrompt += `\n• Certification: ${business.certification}`
    }

    // Add contact information (prioritize direct fields over settings)
    const phone = business.phone || business.settings?.contactInfo?.phone
    const email = business.email || business.settings?.contactInfo?.email
    const address = business.address || business.settings?.contactInfo?.address

    if (phone) systemPrompt += `\n• Phone: ${phone}`
    if (email) systemPrompt += `\n• Email: ${email}`
    if (address) systemPrompt += `\n• Address: ${address}`

    // Add services information
    if (business.services && business.services.length > 0) {
      systemPrompt += '\n\nSERVICES OFFERED:'
      business.services.forEach(service => {
        systemPrompt += `\n• ${service.name}`
        if (service.description) systemPrompt += `: ${service.description}`
        if (service.price) systemPrompt += ` (${service.price})`
        if (service.duration) systemPrompt += ` [Duration: ${service.duration}]`
      })
    }

    // Add specialties and categories
    if (business.specialties && business.specialties.length > 0) {
      systemPrompt += `\n\nSPECIALTIES: ${business.specialties.join(', ')}`
    }
    if (business.categories && business.categories.length > 0) {
      systemPrompt += `\n\nCATEGORIES: ${business.categories.join(', ')}`
    }

    // Add service areas/locations
    if (business.serviceAreas && business.serviceAreas.length > 0) {
      systemPrompt += `\n\nSERVICE AREAS: ${business.serviceAreas.join(', ')}`
    }
    if (business.locations && business.locations.length > 0) {
      systemPrompt += `\n\nLOCATIONS: ${business.locations.join(', ')}`
    }

    // Add business statistics
    if (business.statistics && business.statistics.length > 0) {
      systemPrompt += '\n\nKEY STATISTICS:'
      business.statistics.forEach(stat => {
        systemPrompt += `\n• ${stat.label}: ${stat.value}`
      })
    }

    // Add operating hours with current day context
    if (business.settings?.operatingHours?.enabled) {
      const hours = business.settings.operatingHours.hours
      if (hours) {
        systemPrompt += '\n\nOPERATING HOURS:'
        Object.entries(hours).forEach(([day, schedule]: [string, any]) => {
          const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
          const timeInfo = schedule.open === 'closed' ? 'Closed' : `${schedule.open} - ${schedule.close}`
          systemPrompt += `\n• ${dayCapitalized}: ${timeInfo}`
        })
      }
    }

    // Add specific knowledge base information
    if (knowledgeResults.length > 0) {
      systemPrompt += '\n\nRELEVANT INFORMATION:'
      knowledgeResults.forEach(result => {
        systemPrompt += `\n• Q: ${result.question}\n  A: ${result.answer}`
      })
    }

    // Add industry-specific guidance
    const industryGuidance = this.getIndustrySpecificGuidance(industry)
    if (industryGuidance) {
      systemPrompt += `\n\nINDUSTRY FOCUS:\n${industryGuidance}`
    }

    systemPrompt += `

RESPONSE GUIDELINES:
1. Answer based on provided business context
2. If information isn't available, offer to connect them with the business
3. Suggest relevant actions (contact forms, scheduling, etc.)
4. Be helpful but don't make up information
5. Keep responses concise and actionable
6. Always maintain the specified personality tone

AVAILABLE ACTIONS TO SUGGEST:
• "contact-form" - For general inquiries and lead capture
• "schedule-meeting" - For booking appointments/consultations
• "company-overview" - For detailed business information
• "services-overview" - For service/product details

FUNCTION CALLING:
Use the suggest_content function when users need forms, booking, or specific information pages.

Remember: You represent ${businessName}. Be helpful, accurate, and always act in the business's best interest while serving the customer's needs.`

    return systemPrompt
  }

  /**
   * Get industry-specific guidance for better responses
   */
  private getIndustrySpecificGuidance(industry: string): string {
    const industryLower = industry.toLowerCase()

    if (industryLower.includes('restaurant') || industryLower.includes('food')) {
      return 'Focus on menu items, dietary restrictions, reservations, takeout/delivery, and dining experience.'
    } else if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
      return 'Emphasize appointments, insurance acceptance, services offered, and professional expertise. Never provide medical advice.'
    } else if (industryLower.includes('retail') || industryLower.includes('shop')) {
      return 'Highlight products, pricing, availability, store hours, and purchasing options.'
    } else if (industryLower.includes('professional') || industryLower.includes('consultant')) {
      return 'Focus on expertise, consultation booking, case studies, and professional qualifications.'
    } else if (industryLower.includes('education') || industryLower.includes('training')) {
      return 'Emphasize courses, schedules, enrollment, certifications, and learning outcomes.'
    } else if (industryLower.includes('automotive') || industryLower.includes('car')) {
      return 'Focus on services, appointments, pricing, vehicle types, and maintenance schedules.'
    } else if (industryLower.includes('real estate') || industryLower.includes('property')) {
      return 'Highlight available properties, market expertise, consultation booking, and local knowledge.'
    } else if (industryLower.includes('technology') || industryLower.includes('software')) {
      return 'Focus on technical solutions, demos, support, and implementation services.'
    }

    return ''
  }

  /**
   * Prepare messages for OpenAI API
   */
  private prepareMessages(
    systemPrompt: string,
    conversationHistory: Message[],
    currentMessage: string
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add recent conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })

    // Add current user message
    messages.push({
      role: 'user',
      content: currentMessage
    })

    return messages
  }

  /**
   * Define function calls for structured responses
   */
  private getFunctionDefinitions(): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] {
    return [
      {
        name: 'suggest_content',
        description: 'Suggest relevant content to show the user',
        parameters: {
          type: 'object',
          properties: {
            contentIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of content IDs to suggest'
            },
            intent: {
              type: 'string',
              description: 'The user intent (contact_inquiry, meeting_request, product_inquiry, etc.)'
            },
            confidence: {
              type: 'number',
              description: 'Confidence score between 0 and 1'
            }
          },
          required: ['contentIds', 'intent', 'confidence']
        }
      },
    ]
  }

  /**
   * Process function call responses
   */
  private async processFunctionCall(
    functionCall: OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall,
    context: ConversationContext
  ): Promise<AIResponse> {
    try {
      const functionArgs = JSON.parse(functionCall.arguments || '{}')

      switch (functionCall.name) {
        case 'suggest_content':
          return {
            message: 'Let me help you with that information.',
            suggestedContent: functionArgs.contentIds || [],
            intent: functionArgs.intent || 'general_inquiry',
            confidence: functionArgs.confidence || 0.8
          }

        // search_traders case removed for generic template

        default:
          return this.processTextResponse('I can help you with that.', context)
      }
    } catch (error) {
      console.error('Error processing function call:', error)
      return this.processTextResponse('I can help you with that.', context)
    }
  }

  /**
   * Process regular text responses
   */
  private processTextResponse(content: string, context: ConversationContext): AIResponse {
    // Analyze content for intent and suggestions
    const intent = this.analyzeIntent(content)
    const suggestedContent = this.extractContentSuggestions(content, intent)

    return {
      message: content,
      suggestedContent,
      intent,
      confidence: 0.8
    }
  }

  /**
   * Analyze user intent from response
   */
  private analyzeIntent(content: string): string {
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes('contact') || lowerContent.includes('reach')) {
      return 'contact_inquiry'
    } else if (lowerContent.includes('meeting') || lowerContent.includes('appointment')) {
      return 'meeting_request'
    } else if (lowerContent.includes('service') || lowerContent.includes('product')) {
      return 'service_inquiry'
    } else if (lowerContent.includes('price') || lowerContent.includes('cost')) {
      return 'pricing_inquiry'
    } else {
      return 'general_inquiry'
    }
  }

  /**
   * Extract content suggestions based on intent
   */
  private extractContentSuggestions(content: string, intent: string): string[] {
    const suggestions: string[] = []

    switch (intent) {
      case 'contact_inquiry':
        suggestions.push('contact-form')
        break
      case 'meeting_request':
        suggestions.push('schedule-meeting')
        break
      case 'service_inquiry':
        suggestions.push('services-overview')
        break
      case 'pricing_inquiry':
        suggestions.push('contact-form', 'schedule-meeting')
        break
    }

    return suggestions
  }

  /**
   * Get fallback error message based on business context
   */
  private getErrorFallbackMessage(userMessage: string, business: BusinessConfig | null): string {
    const businessName = business?.name || 'our team'
    return `I'm currently having trouble processing your request. Please contact ${businessName} directly for assistance, or try again in a moment.`
  }

  /**
   * Check if OpenAI service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && !!this.client
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Re-initialize if API key changed
    if (newConfig.apiKey && newConfig.apiKey !== this.config.apiKey) {
      this.initialize()
    }
  }

  /**
   * Get cost optimization statistics
   */
  getCostOptimizationStats(): {
    totalRequests: number
    apiCalls: number
    localResponses: number
    cachedResponses: number
    costSavingsPercent: number
  } {
    const totalRequests = this.apiCallCount + this.localResponseCount + this.cachedResponseCount
    const costSavingsPercent = totalRequests > 0
      ? Math.round(((this.localResponseCount + this.cachedResponseCount) / totalRequests) * 100)
      : 0

    return {
      totalRequests,
      apiCalls: this.apiCallCount,
      localResponses: this.localResponseCount,
      cachedResponses: this.cachedResponseCount,
      costSavingsPercent
    }
  }

  /**
   * Reset cost optimization counters
   */
  resetCostStats(): void {
    this.apiCallCount = 0
    this.localResponseCount = 0
    this.cachedResponseCount = 0
  }
}

// Create singleton instance
export const openaiService = new OpenAIService()