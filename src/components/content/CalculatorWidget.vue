<template>
  <div class="calculator-widget h-full flex flex-col bg-white">
    <div class="flex-1 p-6">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <div class="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ content.title }}</h2>
          <p class="text-gray-600">{{ content.description }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select v-model="selectedService" class="input-field">
              <option value="">Select a service</option>
              <option value="basic">Basic Package - $99/month</option>
              <option value="premium">Premium Package - $199/month</option>
              <option value="enterprise">Enterprise Package - $399/month</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Number of Users
            </label>
            <input
              v-model.number="userCount"
              type="number"
              min="1"
              max="1000"
              class="input-field"
              placeholder="Enter number of users"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contract Length
            </label>
            <select v-model="contractLength" class="input-field">
              <option value="1">Monthly (no discount)</option>
              <option value="12">Annual (10% discount)</option>
              <option value="24">2 Years (15% discount)</option>
            </select>
          </div>

          <div class="border-t pt-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Base Price:</span>
                <span class="font-medium">${{ basePrice }}/month</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Additional Users:</span>
                <span class="font-medium">${{ additionalUserCost }}/month</span>
              </div>
              <div v-if="discount > 0" class="flex justify-between items-center mb-2">
                <span class="text-green-600">Discount:</span>
                <span class="font-medium text-green-600">-${{ discount }}/month</span>
              </div>
              <div class="border-t pt-2 flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">Total:</span>
                <span class="text-lg font-bold text-blue-600">${{ totalPrice }}/month</span>
              </div>
              <div v-if="contractLength > 1" class="text-sm text-gray-500 mt-1">
                Annual total: ${{ (totalPrice * 12).toLocaleString() }}
              </div>
            </div>
          </div>

          <button
            @click="requestQuote"
            :disabled="!selectedService || !userCount"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Custom Quote
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ContentItem, BusinessConfig } from '@/types'

interface Props {
  content: ContentItem
  business: BusinessConfig
}

const props = defineProps<Props>()

const selectedService = ref('')
const userCount = ref(1)
const contractLength = ref(1)

const servicePrices = {
  basic: 99,
  premium: 199,
  enterprise: 399
}

const basePrice = computed(() => {
  if (!selectedService.value) return 0
  return servicePrices[selectedService.value as keyof typeof servicePrices] || 0
})

const additionalUserCost = computed(() => {
  if (!selectedService.value || userCount.value <= 1) return 0
  const costPerUser = selectedService.value === 'basic' ? 10 : selectedService.value === 'premium' ? 15 : 20
  return (userCount.value - 1) * costPerUser
})

const subtotal = computed(() => basePrice.value + additionalUserCost.value)

const discount = computed(() => {
  if (contractLength.value === 12) {
    return Math.round(subtotal.value * 0.1)
  } else if (contractLength.value === 24) {
    return Math.round(subtotal.value * 0.15)
  }
  return 0
})

const totalPrice = computed(() => subtotal.value - discount.value)

function requestQuote() {
  const quoteData = {
    service: selectedService.value,
    users: userCount.value,
    contractLength: contractLength.value,
    monthlyPrice: totalPrice.value,
    annualPrice: totalPrice.value * 12
  }
  
  // Track quote request
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'quote_requested',
      data: quoteData
    }
  }))
  
  // In a real app, this would open a contact form or send to sales
  alert(`Quote requested! Monthly: $${totalPrice.value}, Annual: $${totalPrice.value * 12}`)
}
</script>