<template>
  <div class="product-category-viewer h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 text-sm truncate">{{ content.title }}</h3>
            <p class="text-xs text-gray-500 truncate">
              {{ getDomainFromUrl(content.url || '') }}
              <span class="ml-1 px-1 bg-purple-100 text-purple-600 rounded text-xs">product catalog</span>
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-1">
          <!-- Visit Full Catalog Button -->
          <button
            @click="visitFullCatalog"
            class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Visit full catalog"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Categories Content -->
    <div class="flex-1 overflow-y-auto bg-white">
      <div class="p-6 space-y-6">
        <!-- Header Section -->
        <div class="text-center border-b border-gray-200 pb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Product Categories</h1>
          <p class="text-gray-600">Explore our comprehensive range of FMCG products across multiple categories</p>
          <div class="flex items-center justify-center mt-3 space-x-4 text-sm text-gray-500">
            <span>🌟 500+ Global Brands</span>
            <span>📦 6 Main Categories</span>
            <span>🌍 40+ Countries</span>
          </div>
        </div>

        <!-- Product Categories Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="category in productCategories"
            :key="category.id"
            class="category-card bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
            @click="selectCategory(category)"
          >
            <!-- Category Image -->
            <div class="h-32 relative overflow-hidden">
              <img
                v-if="category.image"
                :src="category.image"
                :alt="category.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center"
              >
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <component :is="category.icon" class="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <!-- Overlay with icon -->
              <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <component :is="category.icon" class="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <!-- Category Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-2">{{ category.name }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ category.description }}</p>

              <!-- Sub-categories -->
              <div class="space-y-1 mb-3">
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub-categories:</div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="sub in category.subcategories.slice(0, 3)"
                    :key="sub"
                    class="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                  >
                    {{ sub }}
                  </span>
                  <span v-if="category.subcategories.length > 3" class="text-xs text-gray-400">
                    +{{ category.subcategories.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Contact Button -->
              <button
                @click.stop="contactForCategory(category)"
                class="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                Inquire Now
              </button>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-purple-50 p-6 rounded-lg">
          <h3 class="font-semibold text-purple-900 mb-3">Product Inquiries</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
              </svg>
              <span class="text-purple-800">Food & Non-Food: +971 52 76 76 100</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
              </svg>
              <span class="text-purple-800">Beauty Professional: +971 50 67 62 217</span>
            </div>
          </div>
        </div>

        <!-- Business Inquiry CTA -->
        <div class="text-center pt-4 border-t border-gray-200">
          <button
            @click="openBusinessInquiry"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Submit Business Inquiry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

interface ProductCategory {
  id: string
  name: string
  description: string
  subcategories: string[]
  icon: any
  image?: string
  whatsappNumber?: string
}

const props = defineProps<Props>()

// Product Categories Data
const productCategories = ref<ProductCategory[]>([
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Wide range of drinks including soft drinks, juices, water, and energy drinks',
    subcategories: ['Soft Drinks', 'Juices', 'Water', 'Energy Drinks', 'Coffee/Tea', 'Sports Drinks'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M5,2V4H3V6H5C5,7.1 5.9,8 7,8H9C10.1,8 11,7.1 11,6H13V4H11V2H5M7,10A7,7 0 0,0 0,17C0,18.1 0.9,19 2,19H12C13.1,19 14,18.1 14,17A7,7 0 0,0 7,10M2,17A5,5 0 0,1 7,12A5,5 0 0,1 12,17' })
    ]),
    image: '/images/products/beverages-unsplash.jpg',
    whatsappNumber: '+971527676100'
  },
  {
    id: 'confectionaries',
    name: 'Confectionaries',
    description: 'Sweet treats including chocolates, candies, gums, and seasonal confections',
    subcategories: ['Chocolates', 'Candies', 'Gums', 'Seasonal Items', 'Premium Sweets', 'Sugar-free Options'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z' })
    ]),
    image: '/images/products/confectionery-unsplash.jpg',
    whatsappNumber: '+971527676100'
  },
  {
    id: 'snacks',
    name: 'Snacks',
    description: 'Delicious snack foods including chips, nuts, crackers, and healthy options',
    subcategories: ['Chips', 'Nuts', 'Crackers', 'Healthy Snacks', 'Cereals', 'Popcorn'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M21,9V7L15,1H5A2,2 0 0,0 3,3V19A2,2 0 0,0 5,21H11V19H5V3H14V8H19V9H21M17.78,10C17.92,10.14 18,10.32 18,10.5C18,10.68 17.92,10.86 17.78,11L16.5,12.28L17.78,13.56C17.92,13.7 18,13.88 18,14.06C18,14.24 17.92,14.42 17.78,14.56L14.56,17.78C14.42,17.92 14.24,18 14.06,18C13.88,18 13.7,17.92 13.56,17.78L12.28,16.5L11,17.78C10.86,17.92 10.68,18 10.5,18C10.32,18 10.14,17.92 10,17.78L6.78,14.56C6.64,14.42 6.56,14.24 6.56,14.06C6.56,13.88 6.64,13.7 6.78,13.56L8.06,12.28L6.78,11C6.64,10.86 6.56,10.68 6.56,10.5C6.56,10.32 6.64,10.14 6.78,10L10,6.78C10.14,6.64 10.32,6.56 10.5,6.56C10.68,6.56 10.86,6.64 11,6.78L12.28,8.06L13.56,6.78C13.7,6.64 13.88,6.56 14.06,6.56C14.24,6.56 14.42,6.64 14.56,6.78L17.78,10Z' })
    ]),
    image: '/images/products/snacks-unsplash.jpg',
    whatsappNumber: '+971527676100'
  },
  {
    id: 'cleaning-household',
    name: 'Cleaning & Household',
    description: 'Complete range of cleaning supplies and household essentials',
    subcategories: ['Detergents', 'Dishwashing', 'Surface Cleaners', 'Paper Products', 'Air Fresheners', 'Household Tools'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M19.36,2.72L20.78,4.14L15.06,9.85C16.13,11.39 16.28,13.24 15.38,14.44L9.06,8.12C10.26,7.22 12.11,7.37 13.65,8.44L19.36,2.72M5.93,17.57C3.92,15.56 2.69,13.16 2.35,10.92L7.23,8.83L14.67,16.27L12.58,21.15C10.34,20.81 7.94,19.58 5.93,17.57Z' })
    ]),
    image: '/images/products/cleaning-unsplash.jpg',
    whatsappNumber: '+971527676100'
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    description: 'Personal hygiene and care products for daily wellness',
    subcategories: ['Oral Care', 'Hair Care', 'Skin Care', 'Hygiene Products', 'Baby Care', 'Health & Wellness'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' })
    ]),
    image: '/images/products/personal-care-unsplash.jpg',
    whatsappNumber: '+971527676100'
  },
  {
    id: 'beauty-equipment',
    name: 'Beauty Equipment',
    description: 'Professional beauty tools and equipment for salons and personal use',
    subcategories: ['Hair Tools', 'Skin Care Devices', 'Nail Equipment', 'Salon Furniture', 'Professional Tools', 'Accessories'],
    icon: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z' })
    ]),
    image: '/images/products/beauty-equipment-unsplash.jpg',
    whatsappNumber: '+971506762217'
  }
])

// Methods
function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}

function selectCategory(category: ProductCategory) {
  // Track category selection
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'product_category_selected',
      data: {
        categoryId: category.id,
        categoryName: category.name,
        business: props.business.name
      }
    }
  }))

  // You could expand this to show more detailed category view
  // For now, it triggers the contact action
  contactForCategory(category)
}

function contactForCategory(category: ProductCategory) {
  const phoneNumber = category.whatsappNumber || '+971527676100'
  const message = `Hi! I'm interested in ${category.name} products. Can you provide more information about your available brands and pricing?`

  // Track contact action
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'product_category_contact',
      data: {
        categoryId: category.id,
        categoryName: category.name,
        contactMethod: 'whatsapp',
        phoneNumber
      }
    }
  }))

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
}

function visitFullCatalog() {
  if (!props.content.url) return

  // Track catalog visit
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'full_catalog_visited',
      data: {
        contentId: props.content.id,
        url: props.content.url,
        source: 'product_category_viewer'
      }
    }
  }))

  window.open(props.content.url, '_blank', 'noopener,noreferrer')
}

function openBusinessInquiry() {
  // Emit event to open business inquiry form
  window.dispatchEvent(new CustomEvent('show-content-by-id', {
    detail: 'business-inquiry-form'
  }))
}
</script>

<style scoped>
.category-card:hover {
  transform: translateY(-2px);
}

.category-card {
  transition: all 0.2s ease;
}

/* Custom scrollbar */
.product-category-viewer {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.product-category-viewer::-webkit-scrollbar {
  width: 6px;
}

.product-category-viewer::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.product-category-viewer::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>