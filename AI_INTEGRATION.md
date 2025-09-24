# AI Integration Guide

## Setup AI Services

### 1. Install Dependencies
```bash
npm install openai @anthropic-ai/sdk
```

### 2. Environment Variables
```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_OPENAI_MODEL=gpt-4o-mini

# Anthropic Claude (optional)
VITE_ANTHROPIC_API_KEY=sk-ant-your-key
VITE_ANTHROPIC_MODEL=claude-3-haiku-20240307

# Choose provider
VITE_AI_PROVIDER=openai  # or anthropic
```

### 3. Create AI Service
Create `src/services/aiService.ts`:
```typescript
interface AIResponse {
  message: string
  suggestedContent?: string[]
  confidence: number
}

class AIService {
  async generateResponse(userMessage: string, context: string[]): Promise<AIResponse>
  async summarizeContent(content: string): Promise<string>
  async generateQA(content: string): Promise<Array<{question: string, answer: string}>>
}
```

### 4. Integration Points

#### Replace Static Chat Responses
- **File**: `src/stores/chat.ts`
- **Change**: Replace pattern matching with AI calls
- **Benefit**: Dynamic, contextual responses

#### Add Content Summarization
- **File**: `src/services/contentProcessor.ts`
- **Use**: Summarize long scraped content
- **Benefit**: Better content management

#### Smart Content Suggestions
- **File**: `src/stores/content.ts`
- **Use**: AI-powered content recommendations
- **Benefit**: Better user experience

## Implementation Steps

### Step 1: Basic AI Chat
```typescript
// In chat store
async function sendMessage(content: string) {
  const aiResponse = await aiService.generateResponse(
    content,
    getConversationContext()
  )

  addMessage({
    role: 'assistant',
    content: aiResponse.message,
    suggestions: aiResponse.suggestedContent
  })
}
```

### Step 2: Content Processing
```typescript
// In scraping service
async function processScrapedContent(content: string) {
  const summary = await aiService.summarizeContent(content)
  const qaList = await aiService.generateQA(content)

  return {
    summary,
    questions: qaList,
    originalContent: content
  }
}
```

### Step 3: Smart Suggestions
```typescript
// In content store
async function suggestContent(conversationHistory: Message[]) {
  const suggestions = await aiService.suggestContent(
    conversationHistory,
    availableContent
  )

  return suggestions.map(s => ({
    contentId: s.id,
    relevanceScore: s.confidence,
    reason: s.explanation
  }))
}
```

## Testing AI Integration

### Unit Tests
- [ ] AI service initializes correctly
- [ ] Generates responses for various inputs
- [ ] Handles API errors gracefully
- [ ] Falls back to static responses when needed

### Integration Tests
- [ ] Chat flow works with AI responses
- [ ] Content suggestions are relevant
- [ ] Performance is acceptable (< 3 seconds)

### Error Handling
- [ ] API key missing/invalid
- [ ] Network connectivity issues
- [ ] Rate limiting
- [ ] AI service downtime

## Cost Management
- **Start small**: Use cheaper models (gpt-4o-mini, claude-3-haiku)
- **Cache responses**: Avoid duplicate API calls
- **Fallback system**: Static responses when AI fails
- **Monitor usage**: Track API costs daily

## Success Metrics
- ✅ **Response Quality**: Users get helpful, relevant answers
- ✅ **Response Time**: < 3 seconds for AI responses
- ✅ **Cost Efficiency**: < $0.10 per conversation
- ✅ **Reliability**: 99%+ uptime with fallbacks