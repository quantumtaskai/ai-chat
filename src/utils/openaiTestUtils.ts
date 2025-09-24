import { openaiService } from '@/services/openaiService'
import type { BusinessConfig } from '@/types'

/**
 * Test utility for OpenAI integration
 */
export class OpenAITestUtils {

  /**
   * Test OpenAI integration with mock business data
   */
  static async testOpenAIIntegration(): Promise<{
    success: boolean
    results: Array<{
      test: string
      input: string
      response: any
      success: boolean
      error?: string
    }>
  }> {
    const results = []

    // Mock business config for testing
    const mockBusiness: BusinessConfig = {
      id: 'test-business',
      name: 'Test Restaurant',
      description: 'A family-owned Italian restaurant serving authentic cuisine',
      industry: 'Restaurant',
      website: 'https://test-restaurant.com',
      branding: {
        primaryColor: '#d32f2f',
        secondaryColor: '#f57c00',
        accentColor: '#388e3c',
        logo: '/images/company/logo.png',
        font: 'Inter'
      },
      settings: {
        welcomeMessage: 'Welcome to our restaurant! How can I help you today?',
        aiPersonality: 'friendly and welcoming, knowledgeable about Italian cuisine',
        enableVoice: true,
        enableLeadCapture: true,
        operatingHours: {
          enabled: true,
          timezone: 'America/New_York',
          hours: {
            monday: { open: '17:00', close: '22:00' },
            tuesday: { open: '17:00', close: '22:00' },
            wednesday: { open: '17:00', close: '22:00' },
            thursday: { open: '17:00', close: '22:00' },
            friday: { open: '17:00', close: '23:00' },
            saturday: { open: '17:00', close: '23:00' },
            sunday: { open: 'closed', close: 'closed' }
          }
        },
        contactInfo: {
          phone: '+1 (555) 123-4567',
          email: 'info@testrestaurant.com',
          address: '123 Main St, City, State 12345'
        }
      },
      knowledgeBase: [
        {
          id: 'menu-info',
          question: 'What kind of food do you serve?',
          answer: 'We serve authentic Italian cuisine including fresh pasta, wood-fired pizzas, and traditional dishes made with imported Italian ingredients.',
          tags: ['menu', 'food', 'cuisine', 'italian'],
          contentIds: ['menu-overview'],
          priority: 10
        }
      ],
      content: [],
      scrapingConfig: {
        enabled: false,
        website: 'https://test-restaurant.com',
        selectors: {},
        contentPriority: [],
        updateSchedule: 'weekly',
        excludeSelectors: []
      }
    }

    const testCases = [
      {
        test: 'Basic greeting',
        input: 'Hello'
      },
      {
        test: 'Business hours inquiry',
        input: 'What are your hours?'
      },
      {
        test: 'Menu inquiry',
        input: 'What kind of food do you serve?'
      },
      {
        test: 'Contact information',
        input: 'How can I contact you?'
      },
      {
        test: 'Reservation request',
        input: 'I would like to make a reservation for tonight'
      }
    ]

    try {
      // Initialize OpenAI service
      const initialized = await openaiService.initialize()
      if (!initialized) {
        return {
          success: false,
          results: [{
            test: 'Initialization',
            input: 'N/A',
            response: 'OpenAI service failed to initialize',
            success: false,
            error: 'Service initialization failed'
          }]
        }
      }

      // Run test cases
      for (const testCase of testCases) {
        try {
          const context = {
            messages: [],
            businessContext: mockBusiness,
            sessionId: 'test-session'
          }

          const response = await openaiService.generateResponse(
            testCase.input,
            context,
            mockBusiness.knowledgeBase
          )

          results.push({
            test: testCase.test,
            input: testCase.input,
            response: response,
            success: true
          })

        } catch (error) {
          results.push({
            test: testCase.test,
            input: testCase.input,
            response: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      return {
        success: successCount === testCases.length,
        results
      }

    } catch (error) {
      return {
        success: false,
        results: [{
          test: 'Service Test',
          input: 'N/A',
          response: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      }
    }
  }

  /**
   * Test conversation context handling
   */
  static async testConversationContext(): Promise<boolean> {
    try {
      const initialized = await openaiService.initialize()
      if (!initialized) return false

      const mockBusiness: BusinessConfig = {
        id: 'test',
        name: 'Test Business',
        description: 'A test business',
        industry: 'Test',
        website: 'https://test.com',
        branding: {
          primaryColor: '#000',
          secondaryColor: '#000',
          accentColor: '#000',
          logo: '',
          font: 'Inter'
        },
        settings: {
          welcomeMessage: 'Hello',
          aiPersonality: 'professional',
          enableVoice: false,
          enableLeadCapture: false,
          contactInfo: {
            phone: '',
            email: '',
            address: ''
          }
        },
        knowledgeBase: [],
        content: [],
        scrapingConfig: {
          enabled: false,
          website: '',
          selectors: {},
          contentPriority: [],
          updateSchedule: 'weekly',
          excludeSelectors: []
        }
      }

      const context = {
        messages: [
          { id: '1', content: 'My name is John', role: 'user' as const, timestamp: new Date() },
          { id: '2', content: 'Nice to meet you, John!', role: 'assistant' as const, timestamp: new Date() }
        ],
        businessContext: mockBusiness,
        sessionId: 'test-session'
      }

      const response = await openaiService.generateResponse(
        'What was my name again?',
        context,
        []
      )

      // Check if the response acknowledges the previous context
      return response.message.toLowerCase().includes('john')

    } catch (error) {
      console.error('Context test failed:', error)
      return false
    }
  }

  /**
   * Print test results in a readable format
   */
  static printTestResults(results: any): void {
    console.log('\n🧪 OpenAI Integration Test Results')
    console.log('='.repeat(50))

    results.results.forEach((result: any, index: number) => {
      console.log(`\n${index + 1}. ${result.test}`)
      console.log(`   Input: "${result.input}"`)
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)

      if (result.success && result.response) {
        console.log(`   Response: "${result.response.message}"`)
        console.log(`   Intent: ${result.response.intent}`)
        console.log(`   Confidence: ${result.response.confidence}`)
        if (result.response.suggestedContent?.length > 0) {
          console.log(`   Suggested Content: ${result.response.suggestedContent.join(', ')}`)
        }
      } else if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    console.log(`\n📊 Overall Success Rate: ${results.results.filter((r: any) => r.success).length}/${results.results.length}`)
    console.log(`🎯 Integration Status: ${results.success ? '✅ WORKING' : '❌ NEEDS ATTENTION'}`)
  }
}

/**
 * Run comprehensive OpenAI tests
 */
export async function runOpenAITests(): Promise<void> {
  console.log('🚀 Starting OpenAI Integration Tests...')

  // Test 1: Basic integration
  const basicResults = await OpenAITestUtils.testOpenAIIntegration()
  OpenAITestUtils.printTestResults(basicResults)

  // Test 2: Conversation context
  console.log('\n🧠 Testing Conversation Context...')
  const contextWorking = await OpenAITestUtils.testConversationContext()
  console.log(`Context Handling: ${contextWorking ? '✅ WORKING' : '❌ NEEDS WORK'}`)

  // Test 3: Service availability
  console.log('\n🔗 Testing Service Availability...')
  const serviceAvailable = openaiService.isAvailable()
  console.log(`Service Available: ${serviceAvailable ? '✅ YES' : '❌ NO'}`)

  console.log('\n✨ OpenAI Integration Testing Complete!')
}