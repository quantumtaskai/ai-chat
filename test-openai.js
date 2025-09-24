#!/usr/bin/env node

/**
 * OpenAI Integration Test Script
 * Tests the OpenAI integration without needing a full app environment
 * Note: This script uses a simplified version since we can't import TypeScript directly in Node.js
 */

import OpenAI from 'openai'

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
    log('\n🔧 Initializing OpenAI client...', 'blue')
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    })

    // Test connection with a simple API call
    const testResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    })

    if (!testResponse.choices[0]?.message) {
      log('❌ OpenAI API test failed - no response', 'red')
      return false
    }

    log('✓ OpenAI API connection successful', 'green')

    // Test business context response
    log('\n💬 Testing business context AI response...', 'blue')

    const businessSystemPrompt = `You are an AI assistant for Test Restaurant, representing a Restaurant business.

BUSINESS PROFILE:
A family restaurant serving Italian cuisine

PERSONALITY: Be friendly and welcoming in all interactions.

CORE RESPONSIBILITIES:
1. Answer questions about the business accurately
2. Help customers find what they need
3. Guide users to take appropriate actions
4. Suggest relevant resources when helpful
5. Qualify potential leads professionally

BUSINESS DETAILS:
• Phone: +1 (555) 123-4567
• Email: info@testrestaurant.com
• Address: 123 Main St, City, State 12345

OPERATING HOURS:
• Monday: 17:00 - 22:00
• Tuesday: 17:00 - 22:00
• Wednesday: 17:00 - 22:00
• Thursday: 17:00 - 22:00
• Friday: 17:00 - 23:00
• Saturday: 17:00 - 23:00
• Sunday: Closed

RELEVANT INFORMATION:
• Q: What kind of food do you serve?
  A: We serve authentic Italian cuisine including fresh pasta, wood-fired pizzas, and traditional dishes.

INDUSTRY FOCUS:
Focus on menu items, dietary restrictions, reservations, takeout/delivery, and dining experience.

RESPONSE GUIDELINES:
1. Answer based on provided business context
2. If information isn't available, offer to connect them with the business
3. Suggest relevant actions (contact forms, scheduling, etc.)
4. Be helpful but don't make up information
5. Keep responses concise and actionable
6. Always maintain the specified personality tone

Remember: You represent Test Restaurant. Be helpful, accurate, and always act in the business's best interest while serving the customer's needs.`

    const testMessage = "Hello! What kind of food do you serve?"
    log(`   Question: "${testMessage}"`, 'cyan')

    const businessResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: businessSystemPrompt },
        { role: 'user', content: testMessage }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    const responseContent = businessResponse.choices[0]?.message?.content
    if (responseContent) {
      log(`   AI Response: "${responseContent}"`, 'green')
    } else {
      log('   No response content received', 'red')
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
    const apiKey = process.env.VITE_OPENAI_API_KEY
    if (!apiKey || apiKey.includes('your_')) {
      log('❌ API key not available for context test', 'red')
      return false
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    })

    const contextMessages = [
      { role: 'system', content: 'You are a helpful assistant. Remember what the user tells you.' },
      { role: 'user', content: 'My name is Sarah' },
      { role: 'assistant', content: 'Nice to meet you, Sarah!' },
      { role: 'user', content: 'What was my name again?' }
    ]

    const testMessage = "What was my name again?"
    log(`   Question: "${testMessage}"`, 'cyan')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: contextMessages,
      max_tokens: 50
    })

    const responseContent = response.choices[0]?.message?.content || ''
    log(`   AI Response: "${responseContent}"`, 'green')

    const remembersName = responseContent.toLowerCase().includes('sarah')
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
      log('   1. Set VITE_OPENAI_API_KEY in your .env file', 'yellow')
      log('   2. Get API key from: https://platform.openai.com/api-keys', 'yellow')
      log('   3. Check OpenAI account has sufficient credits', 'yellow')
      log('   4. Ensure network connectivity', 'yellow')
    }
    if (!contextTest) {
      log('   1. Conversation context needs debugging', 'yellow')
      log('   2. Check message history handling', 'yellow')
    }
    log('\n📚 For detailed help, see: OPENAI-INTEGRATION.md', 'cyan')
  } else {
    log('\n🎉 Your AI chat is ready to go!', 'green')
    log('   Next steps:', 'cyan')
    log('   1. Customize business.json with your company details', 'cyan')
    log('   2. Run `npm run dev` to start the application', 'cyan')
    log('   3. Test with real business scenarios', 'cyan')
    log('\n📖 Full setup guide: README.md', 'blue')
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}