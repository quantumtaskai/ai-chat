import type { BusinessConfig, ScrapingConfig, ScrapedContent, ScrapingRule } from '@/types'

export class BusinessScraper {
  private config: ScrapingConfig

  constructor(business: BusinessConfig) {
    if (!business.scrapingConfig) {
      throw new Error(`No scraping configuration found for business: ${business.name}`)
    }
    this.config = business.scrapingConfig
  }

  /**
   * Scrape the business website and extract content based on configuration
   */
  async scrapeWebsite(): Promise<ScrapedContent[]> {
    if (!this.config.enabled) {
      throw new Error('Scraping is disabled for this business')
    }

    try {
      console.log(`Starting website scraping`)
      console.log(`Target website: ${this.config.website}`)

      const response = await this.fetchWebsite(this.config.website)
      const html = await response.text()

      console.log(`Received HTML length: ${html.length} characters`)
      console.log(`HTML preview: ${html.substring(0, 200)}...`)

      // Parse HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      console.log(`Parsed document title: ${doc.title}`)
      console.log(`Document body length: ${doc.body ? doc.body.innerHTML.length : 'No body found'}`)

      // Extract content based on selectors
      const scrapedContent: ScrapedContent[] = []

      // Process priority content first
      for (const contentType of this.config.contentPriority) {
        const selector = this.config.selectors[contentType]
        if (selector) {
          console.log(`Extracting content type: ${contentType} with selector: ${selector}`)
          const content = await this.extractContent(doc, contentType, selector)
          if (content) {
            console.log(`Successfully extracted ${contentType}: ${content.content.length} characters`)
            scrapedContent.push(content)
          } else {
            console.log(`No content found for ${contentType}`)
          }
        }
      }
      
      // Process remaining selectors
      for (const [contentType, selector] of Object.entries(this.config.selectors)) {
        if (!this.config.contentPriority.includes(contentType)) {
          const content = await this.extractContent(doc, contentType, selector)
          if (content) {
            scrapedContent.push(content)
          }
        }
      }

      // Process custom rules if any
      if (this.config.customRules) {
        for (const rule of this.config.customRules) {
          const content = await this.extractCustomContent(doc, rule)
          if (content) {
            scrapedContent.push(content)
          }
        }
      }

      console.log(`Scraped ${scrapedContent.length} content items`)
      return scrapedContent

    } catch (error) {
      console.error(`Failed to scrape website:`, error)
      throw error
    }
  }

  /**
   * Fetch website with CORS handling
   */
  private async fetchWebsite(url: string): Promise<Response> {
    try {
      console.log(`Attempting to fetch: ${url}`)
      
      // Special handling for localhost testing
      if (url.includes('localhost')) {
        return this.createMockResponse(url)
      }
      
      // For external sites, try normal fetch first
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Receptionist-Scraper/1.0)',
        },
        mode: 'cors',
      })
      
      console.log(`Fetch response status: ${response.status}, ok: ${response.ok}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response
    } catch (error) {
      // Fallback to CORS proxy if direct fetch fails
      console.warn('Direct fetch failed, trying CORS proxy...', error)
      return this.fetchWithProxy(url)
    }
  }

  /**
   * Create mock response for localhost testing
   */
  private async createMockResponse(url: string): Promise<Response> {
    console.log(`Creating mock response for localhost: ${url}`)
    
    // Mock HTML content that represents a typical website
    const mockHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Local Test Website</title>
      </head>
      <body>
        <main class="hero">
          <h1>Welcome to Local Test Website</h1>
          <p>This is a mock website for testing the AI receptionist scraping functionality. Our company provides excellent services and solutions.</p>
        </main>
        
        <section class="services">
          <h2>Our Services</h2>
          <p>We offer web development, AI integration, and consultation services. Our team has expertise in modern technologies and frameworks.</p>
          <ul>
            <li>Web Development</li>
            <li>AI Integration</li>
            <li>Technical Consulting</li>
            <li>System Architecture</li>
          </ul>
        </section>
        
        <section class="contact">
          <h2>Contact Information</h2>
          <p>Get in touch with us:</p>
          <p>Email: info@localtest.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Test Street, Dev City, CODE 12345</p>
        </section>
        
        <section class="pricing">
          <h2>Pricing</h2>
          <p>Our competitive pricing starts at $99/month for basic services. Enterprise plans available with custom pricing.</p>
          <div class="plans">
            <div class="plan">Basic: $99/month</div>
            <div class="plan">Pro: $199/month</div>
            <div class="plan">Enterprise: Contact us</div>
          </div>
        </section>
      </body>
      </html>
    `
    
    return new Response(mockHtml, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html',
      }
    })
  }

  /**
   * Fetch using CORS proxy as fallback
   */
  private async fetchWithProxy(url: string): Promise<Response> {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`Proxy fetch failed: ${response.status} ${response.statusText}`)
    }
    
    return response
  }

  /**
   * Extract content from document using selector
   */
  private async extractContent(
    doc: Document, 
    contentType: string, 
    selector: string
  ): Promise<ScrapedContent | null> {
    try {
      // Remove excluded elements first
      if (this.config.excludeSelectors) {
        this.config.excludeSelectors.forEach(excludeSelector => {
          const excludeElements = doc.querySelectorAll(excludeSelector)
          excludeElements.forEach(el => el.remove())
        })
      }

      const elements = doc.querySelectorAll(selector)
      if (elements.length === 0) {
        console.warn(`No elements found for selector: ${selector}`)
        return null
      }

      // Extract text content from all matching elements
      let content = ''
      let title = contentType

      elements.forEach((element, index) => {
        // Try to get a meaningful title from the first element
        if (index === 0) {
          const titleElement = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .heading')
          if (titleElement) {
            title = titleElement.textContent?.trim() || contentType
          }
        }

        // Extract clean text content
        const text = element.textContent?.trim()
        if (text) {
          content += text + '\n\n'
        }
      })

      if (!content.trim()) {
        return null
      }

      // Clean up content
      content = this.cleanContent(content)

      return {
        id: `${contentType}-${Date.now()}`,
        contentType,
        title,
        content,
        url: this.config.website,
        selector,
        scrapedAt: new Date(),
        priority: this.config.contentPriority.indexOf(contentType) + 1,
        metadata: {
          wordCount: content.split(/\s+/).length,
          contentHash: await this.generateContentHash(content),
        }
      }

    } catch (error) {
      console.error(`Failed to extract content for ${contentType}:`, error)
      return null
    }
  }

  /**
   * Extract content using custom rules
   */
  private async extractCustomContent(
    doc: Document, 
    rule: ScrapingRule
  ): Promise<ScrapedContent | null> {
    try {
      const elements = doc.querySelectorAll(rule.selector)
      if (elements.length === 0 && rule.required) {
        throw new Error(`Required selector not found: ${rule.selector}`)
      }

      let content = ''
      let title = rule.name

      elements.forEach(element => {
        let extracted = ''

        switch (rule.transform) {
          case 'html':
            extracted = element.innerHTML
            break
          case 'links':
            const links = element.querySelectorAll('a[href]')
            extracted = Array.from(links).map(link => 
              `${link.textContent?.trim()}: ${link.getAttribute('href')}`
            ).join('\n')
            break
          case 'images':
            const images = element.querySelectorAll('img[src]')
            extracted = Array.from(images).map(img => 
              `${img.getAttribute('alt') || 'Image'}: ${img.getAttribute('src')}`
            ).join('\n')
            break
          case 'text':
          default:
            if (rule.attribute) {
              extracted = element.getAttribute(rule.attribute) || ''
            } else {
              extracted = element.textContent?.trim() || ''
            }
        }

        if (extracted) {
          content += extracted + '\n\n'
        }
      })

      if (!content.trim()) {
        return null
      }

      content = this.cleanContent(content)

      return {
        id: `${rule.name}-${Date.now()}`,
        contentType: rule.name,
        title,
        content,
        url: this.config.website,
        selector: rule.selector,
        scrapedAt: new Date(),
        priority: 999, // Custom rules get lower priority
        metadata: {
          wordCount: content.split(/\s+/).length,
          contentHash: await this.generateContentHash(content),
        }
      }

    } catch (error) {
      console.error(`Failed to extract custom content for ${rule.name}:`, error)
      if (rule.required) {
        throw error
      }
      return null
    }
  }

  /**
   * Clean and normalize extracted content
   */
  private cleanContent(content: string): string {
    return content
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove multiple newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim()
  }

  /**
   * Generate content hash for change detection
   */
  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Check if content needs updating based on schedule
   */
  public needsUpdate(): boolean {
    if (!this.config.lastScraped) {
      return true
    }

    const now = new Date()
    const lastScraped = new Date(this.config.lastScraped)
    const diffHours = (now.getTime() - lastScraped.getTime()) / (1000 * 60 * 60)

    switch (this.config.updateSchedule) {
      case 'daily':
        return diffHours >= 24
      case 'weekly':
        return diffHours >= 24 * 7
      case 'monthly':
        return diffHours >= 24 * 30
      case 'manual':
        return false
      default:
        return false
    }
  }

  /**
   * Update last scraped timestamp
   */
  public updateLastScraped(): void {
    this.config.lastScraped = new Date()
  }
}

/**
 * Factory function to create scraper for a business
 */
export function createBusinessScraper(business: BusinessConfig): BusinessScraper {
  return new BusinessScraper(business)
}

/**
 * Utility function to validate scraping configuration
 */
export function validateScrapingConfig(config: ScrapingConfig): boolean {
  if (!config.website || !config.selectors || Object.keys(config.selectors).length === 0) {
    return false
  }

  // Validate URL
  try {
    new URL(config.website)
  } catch {
    return false
  }

  return true
}