#!/usr/bin/env node

/**
 * OpenAI Integration Test Script
 * Tests the OpenAI integration without needing a full app environment
 */

import { openaiService } from './src/services/openaiService.js'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testOpenAIConnection() {
  log('\n🤖 OpenAI Integration Test', 'blue')
  log('='.repeat(40), 'blue')

  try {
    // Check environment variable
    const apiKey = process.env.VITE_OPENAI_API_KEY
    if (!apiKey || apiKey.includes('your_')) {
      log('❌ VITE_OPENAI_API_KEY not configured properly', 'red')
      log('   Please set a valid OpenAI API key in .env file', 'yellow')
      return false
    }

    log('✓ API key found in environment', 'green')

    // Test initialization
    log('\n🔧 Initializing OpenAI service...', 'blue')
    const initialized = await openaiService.initialize()

    if (!initialized) {
      log('❌ OpenAI service initialization failed', 'red')
      return false
    }

    log('✓ OpenAI service initialized successfully', 'green')

    // Test simple response
    log('\n💬 Testing AI response generation...', 'blue')

    const mockBusiness = {
      id: 'test-business',
      name: 'Test Restaurant',
      description: 'A family restaurant serving Italian cuisine',
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
        welcomeMessage: 'Welcome to our restaurant!',
        aiPersonality: 'friendly and welcoming',
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
          answer: 'We serve authentic Italian cuisine including fresh pasta, wood-fired pizzas, and traditional dishes.',
          tags: ['menu', 'food', 'italian'],
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

    const context = {
      messages: [],
      businessContext: mockBusiness,
      sessionId: 'test-session-' + Date.now()
    }

    const testMessage = "Hello! What kind of food do you serve?"
    log(`   Question: "${testMessage}"`, 'cyan')

    const response = await openaiService.generateResponse(
      testMessage,
      context,
      mockBusiness.knowledgeBase
    )

    log(`   AI Response: "${response.message}"`, 'green')
    log(`   Intent: ${response.intent}`, 'yellow')
    log(`   Confidence: ${response.confidence}`, 'yellow')

    if (response.suggestedContent && response.suggestedContent.length > 0) {
      log(`   Suggested Content: ${response.suggestedContent.join(', ')}`, 'yellow')
    }

    if (response.error) {
      log(`   Warning: ${response.error}`, 'red')
    }

    log('\n✅ OpenAI integration working successfully!', 'green')
    return true

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red')

    if (error.message.includes('401')) {
      log('   This looks like an API key issue. Please check your OpenAI API key.', 'yellow')
    } else if (error.message.includes('quota')) {
      log('   This looks like a quota/billing issue. Please check your OpenAI account.', 'yellow')
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      log('   This looks like a network connectivity issue.', 'yellow')
    }

    return false
  }
}

// Test conversation context
async function testConversationContext() {
  log('\n🧠 Testing Conversation Context...', 'blue')

  try {
    const mockBusiness = {
      id: 'test',
      name: 'Test Business',
      description: 'A test business',
      industry: 'Test',
      website: 'https://test.com',
      branding: { primaryColor: '#000', secondaryColor: '#000', accentColor: '#000', logo: '', font: 'Inter' },
      settings: {
        welcomeMessage: 'Hello',
        aiPersonality: 'professional',
        enableVoice: false,
        enableLeadCapture: false,
        contactInfo: { phone: '', email: '', address: '' }
      },
      knowledgeBase: [],
      content: [],
      scrapingConfig: { enabled: false, website: '', selectors: {}, contentPriority: [], updateSchedule: 'weekly', excludeSelectors: [] }
    }

    const context = {
      messages: [
        { id: '1', content: 'My name is Sarah', role: 'user', timestamp: new Date() },
        { id: '2', content: 'Nice to meet you, Sarah!', role: 'assistant', timestamp: new Date() }
      ],
      businessContext: mockBusiness,
      sessionId: 'context-test-' + Date.now()
    }

    const testMessage = "What was my name again?"
    log(`   Question: "${testMessage}"`, 'cyan')

    const response = await openaiService.generateResponse(testMessage, context, [])
    log(`   AI Response: "${response.message}"`, 'green')

    const remembersName = response.message.toLowerCase().includes('sarah')
    log(`   Context Memory: ${remembersName ? '✅ Working' : '❌ Not working'}`, remembersName ? 'green' : 'red')

    return remembersName

  } catch (error) {
    log(`❌ Context test failed: ${error.message}`, 'red')
    return false
  }
}

async function main() {
  log('🚀 OpenAI Integration Test Suite', 'blue')
  log('Testing AI chat functionality...\n', 'cyan')

  const connectionTest = await testOpenAIConnection()
  const contextTest = await testConversationContext()

  log('\n📊 Test Summary:', 'blue')
  log(`   Connection Test: ${connectionTest ? '✅ PASSED' : '❌ FAILED'}`, connectionTest ? 'green' : 'red')
  log(`   Context Test: ${contextTest ? '✅ PASSED' : '❌ FAILED'}`, contextTest ? 'green' : 'red')

  const allPassed = connectionTest && contextTest
  log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, allPassed ? 'green' : 'red')

  if (!allPassed) {
    log('\n💡 Next Steps:', 'yellow')
    if (!connectionTest) {
      log('   1. Verify VITE_OPENAI_API_KEY is set correctly in .env', 'yellow')
      log('   2. Check OpenAI account has sufficient credits', 'yellow')
      log('   3. Ensure network connectivity', 'yellow')
    }
    if (!contextTest) {
      log('   1. Conversation context needs debugging', 'yellow')
      log('   2. Check message history handling', 'yellow')
    }
  } else {
    log('\n🎉 Your AI chat is ready to go!', 'green')
    log('   You can now run `npm run dev` to start the application', 'cyan')
  }
}

if (process.env.NODE_ENV !== 'test') {
  main().catch(console.error)
}

export { testOpenAIConnection, testConversationContext }