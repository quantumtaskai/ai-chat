<template>
  <div class="form-display h-full flex flex-col bg-white">
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-6">
          <div class="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ content.title }}</h2>
          <p class="text-gray-600">{{ content.description }}</p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div v-for="field in formFields" :key="field.name" class="form-field">
            <label :for="field.name" class="block text-sm font-medium text-gray-700 mb-1">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>

            <!-- Text Input -->
            <input
              v-if="['text', 'email', 'tel'].includes(field.type)"
              :id="field.name"
              v-model="formData[field.name]"
              :type="field.type"
              :required="field.required"
              class="input-field"
              :placeholder="field.placeholder || `Enter ${field.label.toLowerCase()}`"
            />

            <!-- Select -->
            <select
              v-else-if="field.type === 'select'"
              :id="field.name"
              v-model="formData[field.name]"
              :required="field.required"
              class="input-field"
            >
              <option value="">Select {{ field.label.toLowerCase() }}</option>
              <option v-for="option in field.options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>

            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="field.name"
              v-model="formData[field.name]"
              :required="field.required"
              rows="3"
              class="input-field resize-none"
              :placeholder="field.placeholder || `Enter ${field.label.toLowerCase()}`"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
          </button>
        </form>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <p class="text-green-800 font-medium">Thank you! We'll be in touch soon.</p>
          </div>
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

const formData = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const showSuccess = ref(false)

const formFields = computed(() => {
  return props.content.data?.fields || []
})

async function submitForm() {
  isSubmitting.value = true
  
  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Track form submission
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'lead_captured',
        data: {
          formId: props.content.id,
          formData: formData.value,
          business: props.business.name
        }
      }
    }))
    
    showSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      formData.value = {}
      showSuccess.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>