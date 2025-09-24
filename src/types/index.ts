// Message types
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  contentType?: string
  attachments?: ContentItem[]
}

// Content types
export interface ContentItem {
  id: string
  type: 'pdf' | 'video' | 'image' | 'form' | 'calculator' | 'booking' | 'website' | 'trader' | 'trader-search'
  title: string
  description?: string
  url?: string
  data?: any
  tags: string[]
  category: string
}

// Trader types
export interface TraderContact {
  person: string
  email: string
  phone: string
  website: string
}

export interface TraderItem {
  id: string
  name: string
  country: string
  type: 'Importer' | 'Exporter' | 'Both'
  products: string[]
  contact: TraderContact
  address: string
  yearsInBusiness: number
  annualVolume: number
  tags: string[]
}

export interface TraderSearchQuery {
  query?: string
  country?: string
  type?: 'Importer' | 'Exporter' | 'Both'
  products?: string[]
  minVolume?: number
  maxVolume?: number
  minYears?: number
  tags?: string[]
}

export interface TraderSearchResult {
  traders: TraderItem[]
  totalCount: number
  filters: {
    countries: string[]
    products: string[]
    types: string[]
    volumeRange: { min: number; max: number }
    yearsRange: { min: number; max: number }
  }
}

export interface TraderData {
  traders: TraderItem[]
  metadata: {
    totalTraders: number
    countries: string[]
    productCategories: string[]
    tradeTypes: string[]
    lastUpdated: string
    dataVersion: string
  }
}

// Business configuration
export interface BusinessConfig {
  id: string
  name: string
  description: string
  industry: string
  website?: string
  branding: {
    primaryColor: string
    secondaryColor: string
    logo?: string
    font?: string
  }
  content: ContentItem[]
  knowledgeBase: KnowledgeItem[]
  scrapingConfig?: ScrapingConfig
  settings: {
    welcomeMessage: string
    aiPersonality: string
    enableVoice: boolean
    enableLeadCapture: boolean
    operatingHours?: {
      enabled: boolean
      timezone: string
      hours: { [key: string]: { open: string; close: string } }
    }
    contactInfo?: {
      phone?: string
      email?: string
      address?: string
    }
  }
}

// Knowledge base
export interface KnowledgeItem {
  id: string
  question: string
  answer: string
  tags: string[]
  contentIds?: string[]
  priority: number
}

// User interaction types
export interface UserInteraction {
  sessionId: string
  messages: Message[]
  contentViewed: string[]
  leadData?: LeadData
  timestamp: Date
}

// Lead capture
export interface LeadData {
  name?: string
  email?: string
  phone?: string
  company?: string
  interest?: string
  notes?: string
  status: 'new' | 'qualified' | 'contacted' | 'converted'
}

// Chat state
export interface ChatState {
  messages: Message[]
  isTyping: boolean
  isListening: boolean
  isMuted: boolean
  currentContent: ContentItem | null
  sessionId: string
}

// Content display state
export interface ContentState {
  currentItem: ContentItem | null
  history: ContentItem[]
  isLoading: boolean
}

// AI response with content suggestion
export interface AIResponse {
  message: string
  suggestedContent?: string[]
  intent?: string
  confidence?: number
  followUpQuestions?: string[]
  functionCall?: {
    name: string
    arguments: any
  }
  error?: string
}

// Analytics events
export interface AnalyticsEvent {
  type: 'message_sent' | 'content_viewed' | 'lead_captured' | 'session_started' | 'session_ended'
  data: any
  timestamp: Date
  sessionId: string
}

// Voice synthesis options
export interface VoiceOptions {
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
}

// Application state
export interface AppState {
  isMinimized: boolean
  currentBusiness: BusinessConfig | null
  isLoading: boolean
  error: string | null
}

// Website scraping configuration
export interface ScrapingConfig {
  enabled: boolean
  website: string
  selectors: {
    [key: string]: string // CSS selectors for different content types
  }
  contentPriority: string[] // Order of importance for content types
  updateSchedule: 'daily' | 'weekly' | 'monthly' | 'manual'
  lastScraped?: Date
  excludeSelectors?: string[] // Elements to exclude from scraping
  waitForSelector?: string // Wait for specific element before scraping
  customRules?: ScrapingRule[]
}

// Custom scraping rules for specific content
export interface ScrapingRule {
  name: string
  selector: string
  attribute?: string // Extract attribute instead of text
  transform?: 'text' | 'html' | 'links' | 'images'
  required?: boolean
}

// Scraped content item
export interface ScrapedContent {
  id: string
  contentType: string
  title: string
  content: string
  url: string
  selector?: string
  scrapedAt: Date
  priority: number
  metadata?: {
    wordCount: number
    lastModified?: Date
    contentHash: string
  }
}

// Knowledge base with scraped content
export interface EnhancedKnowledgeItem extends KnowledgeItem {
  scrapedContent?: ScrapedContent[]
  isFromWebsite?: boolean
  lastUpdated?: Date
}

// Re-export calendar types
export * from './calendar'