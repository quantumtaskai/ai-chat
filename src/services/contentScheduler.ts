import type { BusinessConfig } from '@/types'
import { useKnowledgeStore } from '@/stores/knowledge'

export class ContentScheduler {
  private interval: NodeJS.Timeout | null = null
  private currentBusiness: BusinessConfig | null = null

  private getKnowledgeStore() {
    return useKnowledgeStore()
  }

  /**
   * Start automated scraping for the business
   */
  public scheduleBusinessScraping(business: BusinessConfig): void {
    if (!business.scrapingConfig?.enabled || business.scrapingConfig.updateSchedule === 'manual') {
      return
    }

    // Clear existing schedule
    this.clearSchedule()

    const intervalMs = this.getIntervalMs(business.scrapingConfig.updateSchedule)
    if (intervalMs === 0) return

    console.log(`Scheduling auto-scraping for ${business.name} every ${business.scrapingConfig.updateSchedule}`)

    this.currentBusiness = business
    this.interval = setInterval(async () => {
      try {
        console.log(`Auto-scraping triggered for ${business.name}`)
        const knowledgeStore = this.getKnowledgeStore()
        const success = await knowledgeStore.scrapeBusinessWebsite(business)

        if (success) {
          console.log(`Auto-scraping completed successfully for ${business.name}`)
        } else {
          console.error(`Auto-scraping failed for ${business.name}`)
        }
      } catch (error) {
        console.error(`Auto-scraping error for ${business.name}:`, error)
      }
    }, intervalMs)
  }

  /**
   * Stop automated scraping
   */
  public clearSchedule(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      this.currentBusiness = null
      console.log('Cleared scraping schedule')
    }
  }

  /**
   * Check if scraping is currently scheduled
   */
  public isScheduled(): boolean {
    return this.interval !== null
  }

  /**
   * Get active schedule IDs (for compatibility with old code)
   */
  public getActiveSchedules(): string[] {
    return this.interval && this.currentBusiness ? [this.currentBusiness.id] : []
  }

  /**
   * Check if the business needs scraping
   */
  public needsScraping(business: BusinessConfig): boolean {
    if (!business.scrapingConfig?.enabled) return false
    if (business.scrapingConfig.updateSchedule === 'manual') return false

    const lastScraped = business.scrapingConfig.lastScraped
    if (!lastScraped) return true

    const intervalMs = this.getIntervalMs(business.scrapingConfig.updateSchedule)
    if (intervalMs === 0) return false

    const timeSinceLastScrape = Date.now() - new Date(lastScraped).getTime()
    return timeSinceLastScrape >= intervalMs
  }

  /**
   * Get the next scheduled scrape time
   */
  public getNextScrapeTime(business: BusinessConfig): Date | null {
    if (!business.scrapingConfig?.enabled || business.scrapingConfig.updateSchedule === 'manual') {
      return null
    }

    const lastScraped = business.scrapingConfig.lastScraped
    if (!lastScraped) return new Date() // Scrape immediately if never scraped

    const intervalMs = this.getIntervalMs(business.scrapingConfig.updateSchedule)
    if (intervalMs === 0) return null

    return new Date(new Date(lastScraped).getTime() + intervalMs)
  }

  /**
   * Force scraping of the current business
   */
  public async forceScrapeBusiness(business: BusinessConfig): Promise<boolean> {
    try {
      console.log(`Force scraping ${business.name}`)
      const knowledgeStore = this.getKnowledgeStore()
      return await knowledgeStore.scrapeBusinessWebsite(business)
    } catch (error) {
      console.error(`Force scraping failed for ${business.name}:`, error)
      return false
    }
  }

  /**
   * Get interval in milliseconds for a schedule type
   */
  private getIntervalMs(schedule: string): number {
    switch (schedule) {
      case 'daily':
        return 24 * 60 * 60 * 1000
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000
      default:
        console.warn(`Unknown schedule type: ${schedule}`)
        return 0
    }
  }
}

// Export singleton instance
export const contentScheduler = new ContentScheduler()