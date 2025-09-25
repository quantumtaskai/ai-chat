import type { BusinessConfig, KnowledgeItem } from '@/types'

interface BusinessAnalysis {
  suggestedKnowledge: KnowledgeItem[]
  missingInformation: string[]
  optimizationRecommendations: string[]
  industryInsights: string[]
}

export class BusinessIntelligenceService {
  /**
   * Analyze business configuration and suggest improvements
   */
  analyzeBusinessConfig(business: BusinessConfig): BusinessAnalysis {
    const suggestedKnowledge: KnowledgeItem[] = []
    const missingInformation: string[] = []
    const optimizationRecommendations: string[] = []
    const industryInsights: string[] = []

    // Generate core business knowledge entries
    this.generateCoreKnowledge(business, suggestedKnowledge)

    // Identify missing information
    this.identifyMissingInformation(business, missingInformation)

    // Generate optimization recommendations
    this.generateOptimizationRecommendations(business, optimizationRecommendations)

    // Generate industry-specific insights
    this.generateIndustryInsights(business, industryInsights)

    return {
      suggestedKnowledge,
      missingInformation,
      optimizationRecommendations,
      industryInsights
    }
  }

  /**
   * Generate core business knowledge entries from configuration
   */
  private generateCoreKnowledge(business: BusinessConfig, suggested: KnowledgeItem[]): void {
    let priority = 100

    // Business overview
    if (business.description) {
      suggested.push({
        id: `kb_overview_${Date.now()}`,
        question: `What does ${business.name} do?`,
        answer: business.description,
        tags: ['overview', 'about', 'business'],
        priority: priority--
      })
    }

    // Services
    if (business.services && business.services.length > 0) {
      business.services.forEach((service, index) => {
        suggested.push({
          id: `kb_service_${Date.now()}_${index}`,
          question: `Tell me about ${service.name}`,
          answer: service.description || `We offer ${service.name}${service.price ? ` for ${service.price}` : ''}${service.duration ? ` (${service.duration})` : ''}.`,
          tags: ['services', service.name.toLowerCase().replace(/\s+/g, '-')],
          contentIds: ['services-overview'],
          priority: priority--
        })
      })

      // General services question
      const servicesList = business.services.map(s => s.name).join(', ')
      suggested.push({
        id: `kb_services_list_${Date.now()}`,
        question: 'What services do you offer?',
        answer: `We offer the following services: ${servicesList}. Would you like more details about any specific service?`,
        tags: ['services', 'offerings'],
        contentIds: ['services-overview'],
        priority: priority--
      })
    }

    // Contact information
    const phone = business.phone || business.settings?.contactInfo?.phone
    const email = business.email || business.settings?.contactInfo?.email
    const address = business.address || business.settings?.contactInfo?.address

    if (phone || email || address) {
      let contactAnswer = `You can reach ${business.name} through:\n`
      if (phone) contactAnswer += `📞 Phone: ${phone}\n`
      if (email) contactAnswer += `📧 Email: ${email}\n`
      if (address) contactAnswer += `📍 Address: ${address}\n`

      suggested.push({
        id: `kb_contact_${Date.now()}`,
        question: 'How can I contact you?',
        answer: contactAnswer.trim(),
        tags: ['contact', 'phone', 'email', 'address'],
        contentIds: ['contact-form'],
        priority: priority--
      })
    }

    // Operating hours
    if (business.settings?.operatingHours?.enabled) {
      const hours = business.settings.operatingHours.hours
      if (hours) {
        let hoursAnswer = `${business.name} operating hours:\n`
        Object.entries(hours).forEach(([day, schedule]: [string, any]) => {
          const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
          const timeInfo = schedule.open === 'closed' ? 'Closed' : `${schedule.open} - ${schedule.close}`
          hoursAnswer += `• ${dayCapitalized}: ${timeInfo}\n`
        })

        suggested.push({
          id: `kb_hours_${Date.now()}`,
          question: 'What are your operating hours?',
          answer: hoursAnswer.trim(),
          tags: ['hours', 'schedule', 'open', 'closed'],
          priority: priority--
        })
      }
    }

    // Location and service areas
    if (business.serviceAreas && business.serviceAreas.length > 0) {
      suggested.push({
        id: `kb_service_areas_${Date.now()}`,
        question: 'What areas do you serve?',
        answer: `We serve the following areas: ${business.serviceAreas.join(', ')}.`,
        tags: ['location', 'service-areas', 'coverage'],
        priority: priority--
      })
    }

    // Mission and values
    if (business.mission) {
      suggested.push({
        id: `kb_mission_${Date.now()}`,
        question: `What is ${business.name}'s mission?`,
        answer: business.mission,
        tags: ['mission', 'values', 'about'],
        priority: priority--
      })
    }

    if (business.vision) {
      suggested.push({
        id: `kb_vision_${Date.now()}`,
        question: `What is ${business.name}'s vision?`,
        answer: business.vision,
        tags: ['vision', 'future', 'goals'],
        priority: priority--
      })
    }

    // Certifications and credentials
    if (business.certification) {
      suggested.push({
        id: `kb_certification_${Date.now()}`,
        question: 'Do you have any certifications?',
        answer: `Yes, ${business.name} is ${business.certification} certified.`,
        tags: ['certification', 'credentials', 'quality'],
        priority: priority--
      })
    }

    // Specialties
    if (business.specialties && business.specialties.length > 0) {
      suggested.push({
        id: `kb_specialties_${Date.now()}`,
        question: 'What are your specialties?',
        answer: `Our specialties include: ${business.specialties.join(', ')}.`,
        tags: ['specialties', 'expertise', 'focus'],
        priority: priority--
      })
    }
  }

  /**
   * Identify missing critical business information
   */
  private identifyMissingInformation(business: BusinessConfig, missing: string[]): void {
    // Essential contact information
    const phone = business.phone || business.settings?.contactInfo?.phone
    const email = business.email || business.settings?.contactInfo?.email
    const address = business.address || business.settings?.contactInfo?.address

    if (!phone) missing.push('Phone number for customer contact')
    if (!email) missing.push('Email address for inquiries')
    if (!address) missing.push('Business address or location')

    // Services and offerings
    if (!business.services || business.services.length === 0) {
      missing.push('Services or products offered')
    }

    // Operating hours
    if (!business.settings?.operatingHours?.enabled) {
      missing.push('Operating hours and schedule')
    }

    // Business description
    if (!business.description || business.description.length < 50) {
      missing.push('Detailed business description')
    }

    // Service areas
    if (!business.serviceAreas || business.serviceAreas.length === 0) {
      missing.push('Service areas or geographic coverage')
    }

    // Mission/vision
    if (!business.mission && !business.vision) {
      missing.push('Mission statement or company vision')
    }

    // Pricing information
    if (business.services && business.services.length > 0) {
      const servicesWithoutPricing = business.services.filter(s => !s.price)
      if (servicesWithoutPricing.length > 0) {
        missing.push('Pricing information for services')
      }
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(business: BusinessConfig, recommendations: string[]): void {
    // Knowledge base optimization
    if (!business.knowledgeBase || business.knowledgeBase.length < 5) {
      recommendations.push('Add more knowledge base entries to handle common customer questions')
    }

    // Content optimization
    if (!business.content || business.content.length < 3) {
      recommendations.push('Add content items (PDFs, videos, forms) to better engage visitors')
    }

    // Lead capture optimization
    if (!business.settings?.enableLeadCapture) {
      recommendations.push('Enable lead capture to collect potential customer information')
    }

    // Voice support
    if (!business.settings?.enableVoice) {
      recommendations.push('Consider enabling voice support for better accessibility')
    }

    // Website scraping
    if (!business.scrapingConfig) {
      recommendations.push('Configure website scraping to automatically update knowledge base')
    }

    // Industry-specific recommendations
    this.addIndustrySpecificRecommendations(business, recommendations)
  }

  /**
   * Add industry-specific optimization recommendations
   */
  private addIndustrySpecificRecommendations(business: BusinessConfig, recommendations: string[]): void {
    const industry = business.industry.toLowerCase()

    if (industry.includes('restaurant') || industry.includes('food')) {
      recommendations.push('Add menu items and dietary information to services')
      recommendations.push('Include delivery/takeout options in service areas')
    } else if (industry.includes('healthcare') || industry.includes('medical')) {
      recommendations.push('Add appointment booking capabilities')
      recommendations.push('Include insurance and payment information')
    } else if (industry.includes('retail') || industry.includes('shop')) {
      recommendations.push('Add product catalog and pricing information')
      recommendations.push('Include shipping and return policies')
    } else if (industry.includes('professional') || industry.includes('consultant')) {
      recommendations.push('Add case studies and portfolio content')
      recommendations.push('Include consultation booking system')
    }
  }

  /**
   * Generate industry-specific insights
   */
  private generateIndustryInsights(business: BusinessConfig, insights: string[]): void {
    const industry = business.industry.toLowerCase()

    if (industry.includes('restaurant') || industry.includes('food')) {
      insights.push('Consider adding online ordering and reservation capabilities')
      insights.push('Food businesses benefit from showcasing menu photos and reviews')
      insights.push('Include information about dietary restrictions and allergens')
    } else if (industry.includes('healthcare') || industry.includes('medical')) {
      insights.push('Healthcare businesses should emphasize credentials and certifications')
      insights.push('Consider adding patient portal or appointment scheduling')
      insights.push('Include information about insurance acceptance and payment options')
    } else if (industry.includes('retail') || industry.includes('shop')) {
      insights.push('Retail businesses benefit from product catalogs and inventory information')
      insights.push('Consider adding customer reviews and testimonials')
      insights.push('Include shipping, return, and warranty policies')
    } else if (industry.includes('professional') || industry.includes('consultant')) {
      insights.push('Professional services should highlight expertise and case studies')
      insights.push('Consider adding client testimonials and success stories')
      insights.push('Include clear consultation booking and pricing information')
    }

    // General insights
    insights.push('Regular website scraping keeps your AI knowledge up-to-date')
    insights.push('Lead capture forms help convert visitors into customers')
    insights.push('Voice support improves accessibility and user experience')
  }

  /**
   * Auto-generate knowledge base from existing business information
   */
  generateSmartKnowledgeBase(business: BusinessConfig): KnowledgeItem[] {
    const analysis = this.analyzeBusinessConfig(business)
    return analysis.suggestedKnowledge
  }

  /**
   * Get business readiness score (0-100)
   */
  getBusinessReadinessScore(business: BusinessConfig): {
    score: number
    breakdown: {
      basicInfo: number
      contactInfo: number
      services: number
      knowledgeBase: number
      content: number
    }
  } {
    let basicInfoScore = 0
    let contactInfoScore = 0
    let servicesScore = 0
    let knowledgeBaseScore = 0
    let contentScore = 0

    // Basic information (25 points)
    if (business.name) basicInfoScore += 5
    if (business.description && business.description.length >= 50) basicInfoScore += 10
    if (business.industry) basicInfoScore += 5
    if (business.mission || business.vision) basicInfoScore += 5

    // Contact information (25 points)
    const phone = business.phone || business.settings?.contactInfo?.phone
    const email = business.email || business.settings?.contactInfo?.email
    const address = business.address || business.settings?.contactInfo?.address

    if (phone) contactInfoScore += 8
    if (email) contactInfoScore += 8
    if (address) contactInfoScore += 4
    if (business.settings?.operatingHours?.enabled) contactInfoScore += 5

    // Services (25 points)
    if (business.services && business.services.length > 0) {
      servicesScore += 15
      const servicesWithDetails = business.services.filter(s => s.description).length
      servicesScore += Math.min(10, servicesWithDetails * 2)
    }

    // Knowledge base (15 points)
    if (business.knowledgeBase && business.knowledgeBase.length > 0) {
      knowledgeBaseScore += Math.min(15, business.knowledgeBase.length * 3)
    }

    // Content (10 points)
    if (business.content && business.content.length > 0) {
      contentScore += Math.min(10, business.content.length * 2)
    }

    const totalScore = basicInfoScore + contactInfoScore + servicesScore + knowledgeBaseScore + contentScore

    return {
      score: Math.min(100, totalScore),
      breakdown: {
        basicInfo: basicInfoScore,
        contactInfo: contactInfoScore,
        services: servicesScore,
        knowledgeBase: knowledgeBaseScore,
        content: contentScore
      }
    }
  }
}

// Create singleton instance
export const businessIntelligenceService = new BusinessIntelligenceService()