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

      // Process function calls if present
      if (assistantMessage.function_call) {
        return await this.processFunctionCall(assistantMessage.function_call, context)
      }

      // Regular text response
      return this.processTextResponse(assistantMessage.content || '', context)

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

    // Add contact information
    if (business.settings?.contactInfo) {
      const contact = business.settings.contactInfo
      systemPrompt += `\n• Phone: ${contact.phone || 'Contact via form'}`
      systemPrompt += `\n• Email: ${contact.email || 'Available via contact form'}`
      if (contact.address) {
        systemPrompt += `\n• Address: ${contact.address}`
      }
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
Use the search_traders function only for B2B trading partner inquiries.

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
      {
        name: 'search_traders',
        description: 'Search for business trading partners',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for traders'
            },
            country: {
              type: 'string',
              description: 'Country filter'
            },
            products: {
              type: 'array',
              items: { type: 'string' },
              description: 'Product categories'
            },
            type: {
              type: 'string',
              enum: ['Importer', 'Exporter', 'Both'],
              description: 'Trader type'
            }
          },
          required: ['query']
        }
      }
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

        case 'search_traders':
          return {
            message: 'I found some relevant trading partners for you.',
            suggestedContent: ['trader-search-results'],
            intent: 'trader_discovery',
            confidence: 0.9,
            functionCall: {
              name: 'search_traders',
              arguments: functionArgs
            }
          }

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
}

// Create singleton instance
export const openaiService = new OpenAIService()