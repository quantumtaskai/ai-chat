# Advanced Scraping Implementation

## Current vs Enhanced Scraping

### Current System
- ❌ **Basic CSS selectors** - Miss dynamic content
- ❌ **Static text extraction** - No content understanding
- ❌ **Manual configuration** - Requires CSS knowledge
- ❌ **No duplicate detection** - Scrapes same content repeatedly

### Enhanced System
- ✅ **Dynamic content handling** - JavaScript-rendered pages
- ✅ **Smart content detection** - AI finds important sections
- ✅ **Automatic configuration** - Learns from website structure
- ✅ **Intelligent deduplication** - Semantic similarity detection

## Implementation Steps

### 1. Install Dependencies
```bash
npm install playwright cheerio readability-cli similarity
```

### 2. Create Advanced Scraper
Create `src/services/advancedScraper.ts`:

```typescript
interface ScrapingResult {
  content: string
  contentType: 'about' | 'services' | 'pricing' | 'contact'
  quality: number
  lastModified: Date
  url: string
}

class AdvancedScraper {
  async scrapeWebsite(url: string): Promise<ScrapingResult[]>
  async detectContentSections(page: Page): Promise<Element[]>
  async classifyContent(content: string): Promise<string>
  async scoreContentQuality(content: string): Promise<number>
}
```

### 3. Dynamic Content Loading
```typescript
// Use Playwright for JavaScript-heavy sites
async function scrapeDynamicContent(url: string) {
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage()

  await page.goto(url)
  await page.waitForLoadState('networkidle') // Wait for JS to load

  const content = await page.content()
  await browser.close()

  return content
}
```

### 4. Smart Content Detection
```typescript
// AI-powered content section detection
async function detectImportantSections(html: string) {
  const $ = cheerio.load(html)

  // Find main content areas
  const mainSelectors = [
    'main', '[role="main"]', '.main-content',
    'article', '.content', '#content'
  ]

  // Score sections by content quality
  const sections = []
  for (const selector of mainSelectors) {
    const elements = $(selector)
    elements.each((i, el) => {
      const text = $(el).text().trim()
      if (text.length > 100) { // Meaningful content
        sections.push({
          selector,
          content: text,
          quality: scoreContent(text)
        })
      }
    })
  }

  return sections.sort((a, b) => b.quality - a.quality)
}
```

### 5. Content Classification
```typescript
// Classify content type using keywords/AI
function classifyContent(text: string): string {
  const patterns = {
    about: ['about us', 'company', 'mission', 'history', 'team'],
    services: ['services', 'products', 'solutions', 'offerings'],
    pricing: ['pricing', 'plans', 'cost', 'packages', 'rates'],
    contact: ['contact', 'reach us', 'get in touch', 'address']
  }

  const scores = {}
  for (const [type, keywords] of Object.entries(patterns)) {
    scores[type] = keywords.reduce((score, keyword) => {
      return score + (text.toLowerCase().includes(keyword) ? 1 : 0)
    }, 0)
  }

  return Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  )
}
```

### 6. Duplicate Detection
```typescript
// Semantic similarity check
import { similarity } from 'similarity'

function isDuplicate(newContent: string, existingContent: string[]): boolean {
  return existingContent.some(existing =>
    similarity(newContent, existing) > 0.85 // 85% similarity threshold
  )
}
```

## Configuration Updates

### Enhanced Business Config
```json
{
  "scrapingConfig": {
    "enabled": true,
    "website": "https://company.com",
    "mode": "intelligent", // auto-detect vs manual selectors
    "updateSchedule": "weekly",
    "contentTypes": ["about", "services", "pricing", "contact"],
    "qualityThreshold": 0.7,
    "duplicateThreshold": 0.85,
    "maxPages": 10,
    "excludePatterns": ["blog", "news", "careers"]
  }
}
```

## Testing Strategy

### Test Different Website Types
- [ ] **Static HTML sites** (basic websites)
- [ ] **React/Vue SPAs** (JavaScript-heavy)
- [ ] **WordPress sites** (CMS-based)
- [ ] **E-commerce sites** (complex structure)
- [ ] **Corporate sites** (multiple pages)

### Quality Checks
- [ ] Content extraction accuracy > 90%
- [ ] Proper content type classification
- [ ] No duplicate content in knowledge base
- [ ] Handles errors gracefully (404, timeouts)
- [ ] Respects robots.txt and rate limits

## Integration Points

### Update Knowledge Store
```typescript
// In knowledge.ts store
async function updateFromScraping(scrapedContent: ScrapingResult[]) {
  for (const content of scrapedContent) {
    if (!isDuplicate(content.content, existingKnowledge)) {
      const qaList = await aiService.generateQA(content.content)
      addToKnowledgeBase(qaList, content.contentType)
    }
  }
}
```

### Scheduler Enhancement
```typescript
// More intelligent scheduling based on content changes
async function scheduleScraping(business: BusinessConfig) {
  const lastScrape = business.scrapingConfig.lastScraped
  const websiteChanged = await checkWebsiteChanges(business.website)

  if (websiteChanged || isScheduledTime(lastScrape)) {
    await runScraping(business)
  }
}
```

## Success Metrics
- ✅ **Accuracy**: 90%+ relevant content extraction
- ✅ **Coverage**: Finds all important business information
- ✅ **Efficiency**: No duplicate content in knowledge base
- ✅ **Reliability**: Handles 95%+ of websites successfully
- ✅ **Performance**: Scrapes typical business site in < 30 seconds