<template>
  <div class="trader-card h-full flex flex-col bg-white">
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto">
        <!-- Trader Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ trader.name }}</h2>
          <div class="flex items-center justify-center space-x-3 mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {{ trader.country }}
            </span>
            <span :class="typeColors[trader.type]" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
              {{ trader.type }}
            </span>
          </div>
        </div>

        <!-- Business Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ formatVolume(trader.annualVolume) }}</div>
            <div class="text-sm text-blue-800">Annual Volume</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600 mb-1">{{ trader.yearsInBusiness }}</div>
            <div class="text-sm text-green-800">Years in Business</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-600 mb-1">{{ trader.products.length }}</div>
            <div class="text-sm text-purple-800">Product Lines</div>
          </div>
        </div>

        <!-- Products -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Product Specialties</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="product in trader.products"
              :key="product"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {{ product }}
            </span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
              <span class="text-gray-900 font-medium">{{ trader.contact.person }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
              </svg>
              <a :href="`mailto:${trader.contact.email}`" class="text-blue-600 hover:text-blue-800">
                {{ trader.contact.email }}
              </a>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
              </svg>
              <a :href="`tel:${trader.contact.phone}`" class="text-blue-600 hover:text-blue-800">
                {{ trader.contact.phone }}
              </a>
            </div>
            <div v-if="trader.contact.website" class="flex items-center">
              <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              <a :href="trader.contact.website" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">
                {{ getDomainFromUrl(trader.contact.website) }}
              </a>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Address</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
              </svg>
              <span class="text-gray-700">{{ trader.address }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="openWhatsApp"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
            </svg>
            Contact via WhatsApp
          </button>
          <button
            @click="sendEmail"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
            </svg>
            Send Email
          </button>
          <button
            v-if="trader.contact.website"
            @click="openWebsite"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            Visit Website
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TraderItem, BusinessConfig } from '@/types'

interface Props {
  content: {
    data: TraderItem
  }
  business: BusinessConfig
}

const props = defineProps<Props>()

const trader = props.content.data

const typeColors = {
  'Importer': 'bg-green-100 text-green-800',
  'Exporter': 'bg-blue-100 text-blue-800',
  'Both': 'bg-purple-100 text-purple-800'
}

function formatVolume(volume: number): string {
  return `$${(volume / 1000000).toFixed(1)}M`
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}

function openWhatsApp() {
  const message = `Hello ${trader.contact.person}, I found your company ${trader.name} through Far Way Company's trader network. I'm interested in discussing potential business opportunities in ${trader.products.join(', ')}.`
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${trader.contact.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

  // Track interaction
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'trader_contact',
      data: {
        traderId: trader.id,
        contactMethod: 'whatsapp',
        traderName: trader.name,
        country: trader.country
      }
    }
  }))
}

function sendEmail() {
  const subject = `Business Inquiry - ${trader.products.join(', ')}`
  const body = `Dear ${trader.contact.person},

I hope this email finds you well. I discovered your company, ${trader.name}, through Far Way Company's international trader network.

I am interested in exploring potential business opportunities with your company, particularly in the following areas:
- ${trader.products.join('\n- ')}

About ${trader.name}:
- Location: ${trader.country}
- Trade Type: ${trader.type}
- Years in Business: ${trader.yearsInBusiness}
- Annual Volume: ${formatVolume(trader.annualVolume)}

I would appreciate the opportunity to discuss how we might work together. Please let me know your availability for a brief call or meeting.

Thank you for your time, and I look forward to hearing from you.

Best regards,
[Your Name]`

  const emailUrl = `mailto:${trader.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = emailUrl

  // Track interaction
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'trader_contact',
      data: {
        traderId: trader.id,
        contactMethod: 'email',
        traderName: trader.name,
        country: trader.country
      }
    }
  }))
}

function openWebsite() {
  if (trader.contact.website) {
    window.open(trader.contact.website, '_blank', 'noopener,noreferrer')

    // Track interaction
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'trader_website_visit',
        data: {
          traderId: trader.id,
          traderName: trader.name,
          website: trader.contact.website
        }
      }
    }))
  }
}
</script>

<style scoped>
.trader-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
</style>