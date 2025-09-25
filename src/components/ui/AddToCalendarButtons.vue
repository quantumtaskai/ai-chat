<template>
  <div class="add-to-calendar bg-white border border-gray-200 rounded-lg p-4">
    <!-- Main Add to Calendar Button -->
    <div class="text-center">
      <button
        @click="addToSystemCalendar"
        class="add-calendar-btn w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
      >
        <div class="flex items-center justify-center space-x-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
          </svg>
          <div>
            <div class="text-lg">📅 Add to Calendar</div>
            <div class="text-sm opacity-90">Opens your default calendar app</div>
          </div>
        </div>
      </button>
    </div>

    <!-- Meeting Details Summary -->
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-700 space-y-2">
        <div class="flex justify-between">
          <span class="font-medium">Service:</span>
          <span>{{ meetingDetails.service }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Date:</span>
          <span>{{ formatMeetingDate(meetingDetails.startDate) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Time:</span>
          <span>{{ formatMeetingTime(meetingDetails.startDate, meetingDetails.endDate) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Location:</span>
          <span class="text-right text-xs">{{ meetingDetails.location }}</span>
        </div>
      </div>
    </div>

    <!-- Platform-specific Help Text -->
    <div class="mt-3 text-center">
      <p class="text-xs text-gray-500">
        {{ getPlatformHelpText() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { openSystemCalendar, detectPlatform } from '@/utils/calendarUtils'
import type { CalendarEvent } from '@/types/calendar'

interface Props {
  service: string
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  contactInfo: {
    name: string
    email: string
    phone?: string
  }
  businessName: string
}

const props = defineProps<Props>()

// Computed meeting details
const meetingDetails = computed((): CalendarEvent => {
  const startDate = new Date(`${props.date}T${props.time}:00`)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration

  return {
    title: `${props.service} - ${props.businessName}`,
    description: `Business consultation meeting for ${props.service} with ${props.businessName}.\n\nAttendee: ${props.contactInfo.name}\nEmail: ${props.contactInfo.email}${props.contactInfo.phone ? `\nPhone: ${props.contactInfo.phone}` : ''}`,
    startDate,
    endDate,
    location: 'Business Location (to be confirmed)',
    attendees: [props.contactInfo.email],
    organizer: {
      name: props.businessName,
      email: props.contactInfo.email || 'contact@yourbusiness.com'
    }
  }
})

// Methods
function addToSystemCalendar() {
  openSystemCalendar(meetingDetails.value)
}

function getPlatformHelpText(): string {
  const platform = detectPlatform()

  const helpTexts = {
    'windows': 'Will open Windows Calendar or your default calendar app',
    'macos': 'Will open macOS Calendar or your default calendar app',
    'ios': 'Will open iOS Calendar app',
    'android': 'Will open your default calendar app',
    'unknown': 'Will download calendar file to import into your calendar'
  }

  return helpTexts[platform as keyof typeof helpTexts] || helpTexts.unknown
}

function formatMeetingDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatMeetingTime(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const end = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `${start} - ${end} (Dubai Time)`
}
</script>

<style scoped>
.add-calendar-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.add-calendar-btn:hover {
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
}

.add-calendar-btn:active {
  transform: scale(0.98);
}

/* Enhanced mobile experience */
@media (max-width: 640px) {
  .add-calendar-btn {
    @apply py-3 px-4;
  }

  .add-calendar-btn div div:first-child {
    @apply text-base;
  }

  .add-calendar-btn div div:last-child {
    @apply text-xs;
  }
}

/* Accessibility improvements */
.add-calendar-btn:focus {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
}

/* Animation for button interaction */
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.add-calendar-btn:hover {
  animation: pulse-subtle 1.5s infinite;
}
</style>