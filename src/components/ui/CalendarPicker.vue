<template>
  <div class="calendar-picker bg-white border border-gray-200 rounded-lg shadow-sm">
    <!-- Calendar Header -->
    <div class="calendar-header flex items-center justify-between p-4 border-b border-gray-200">
      <button
        @click="navigateMonth('prev')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="!canNavigatePrev"
      >
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <div class="flex items-center space-x-2">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ monthName }} {{ currentYear }}
        </h3>
      </div>

      <button
        @click="navigateMonth('next')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="!canNavigateNext"
      >
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.59 12L15 16.41 16.41 15 13.83 12.5 16.41 10 15 8.59z"/>
        </svg>
      </button>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid p-4">
      <!-- Day Names Header -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="dayName in dayNames"
          :key="dayName"
          class="text-center text-sm font-medium text-gray-500 py-2"
        >
          {{ dayName }}
        </div>
      </div>

      <!-- Date Grid -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(calendarDate, index) in monthData.dates"
          :key="index"
          @click="selectDate(calendarDate)"
          :disabled="!calendarDate.isAvailable || calendarDate.isPast"
          class="calendar-date relative p-2 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="getDateClasses(calendarDate)"
        >
          <span class="relative z-10">{{ calendarDate.day }}</span>

          <!-- Today indicator -->
          <div
            v-if="calendarDate.isToday && !calendarDate.isSelected"
            class="absolute inset-0 rounded-lg border-2 border-blue-400"
          ></div>

          <!-- Selected indicator -->
          <div
            v-if="calendarDate.isSelected"
            class="absolute inset-0 bg-blue-600 rounded-lg"
          ></div>

          <!-- Available indicator -->
          <div
            v-if="calendarDate.isAvailable && calendarDate.isCurrentMonth && !calendarDate.isSelected && !calendarDate.isPast"
            class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"
          ></div>
        </button>
      </div>
    </div>

    <!-- Selected Date Info -->
    <div v-if="selectedDate" class="calendar-footer p-4 border-t border-gray-200 bg-gray-50">
      <div class="text-sm text-gray-600">
        <span class="font-medium">Selected:</span>
        {{ formatSelectedDate(selectedDate) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CalendarUtils, defaultCalendarConfig } from '@/utils/calendarUtils'
import type { CalendarDate, CalendarMonth } from '@/types/calendar'

interface Props {
  modelValue?: Date | null
  minDate?: Date
  maxDate?: Date
  disabledDates?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: Date | null): void
  (e: 'dateSelected', value: Date): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDate = ref<Date | null>(props.modelValue || null)

// Calendar utility instance
const calendarConfig = {
  ...defaultCalendarConfig,
  minDate: props.minDate || defaultCalendarConfig.minDate,
  maxDate: props.maxDate || defaultCalendarConfig.maxDate
}
const calendarUtils = new CalendarUtils(calendarConfig)

// Computed properties
const monthData = computed((): CalendarMonth => {
  return calendarUtils.generateMonth(currentYear.value, currentMonth.value, selectedDate.value)
})

const monthName = computed((): string => {
  return calendarUtils.getMonthName(currentMonth.value)
})

const dayNames = computed((): string[] => {
  return calendarUtils.getDayNames()
})

const canNavigatePrev = computed((): boolean => {
  if (!calendarConfig.minDate) return true
  const prevMonth = calendarUtils.navigateMonth(currentYear.value, currentMonth.value, 'prev')
  const prevMonthEnd = new Date(prevMonth.year, prevMonth.month + 1, 0)
  return prevMonthEnd >= calendarConfig.minDate
})

const canNavigateNext = computed((): boolean => {
  if (!calendarConfig.maxDate) return true
  const nextMonth = calendarUtils.navigateMonth(currentYear.value, currentMonth.value, 'next')
  const nextMonthStart = new Date(nextMonth.year, nextMonth.month, 1)
  return nextMonthStart <= calendarConfig.maxDate
})

// Methods
function navigateMonth(direction: 'prev' | 'next') {
  const newMonth = calendarUtils.navigateMonth(currentYear.value, currentMonth.value, direction)
  currentYear.value = newMonth.year
  currentMonth.value = newMonth.month
}

function selectDate(calendarDate: CalendarDate) {
  if (!calendarDate.isAvailable || calendarDate.isPast) return

  const newSelectedDate = new Date(calendarDate.date)
  selectedDate.value = newSelectedDate

  emit('update:modelValue', newSelectedDate)
  emit('dateSelected', newSelectedDate)
}

function getDateClasses(calendarDate: CalendarDate): string {
  const classes = []

  // Base styles
  classes.push('hover:bg-gray-100')

  // Current month vs other months
  if (!calendarDate.isCurrentMonth) {
    classes.push('text-gray-300')
  } else {
    classes.push('text-gray-900')
  }

  // Selected state
  if (calendarDate.isSelected) {
    classes.push('text-white font-semibold')
  }

  // Today state
  if (calendarDate.isToday && !calendarDate.isSelected) {
    classes.push('font-semibold text-blue-600')
  }

  // Availability
  if (calendarDate.isAvailable && calendarDate.isCurrentMonth && !calendarDate.isPast) {
    classes.push('hover:bg-blue-50 cursor-pointer')
  } else {
    classes.push('cursor-not-allowed opacity-50')
  }

  // Weekend styling
  if (calendarDate.isWeekend) {
    classes.push('text-red-400')
  }

  return classes.join(' ')
}

function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Initialize calendar to selected date if provided
onMounted(() => {
  if (selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth()
    currentYear.value = selectedDate.value.getFullYear()
  }
})

// Watch for external modelValue changes
import { watch } from 'vue'
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
  if (newValue) {
    currentMonth.value = newValue.getMonth()
    currentYear.value = newValue.getFullYear()
  }
})
</script>

<style scoped>
.calendar-picker {
  width: 100%;
  max-width: 320px;
}

.calendar-date {
  aspect-ratio: 1;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-date:disabled {
  pointer-events: none;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .calendar-picker {
    max-width: 100%;
  }

  .calendar-date {
    min-height: 36px;
    font-size: 0.875rem;
  }
}

/* Smooth animations */
.calendar-date {
  transition: all 0.2s ease-in-out;
}

.calendar-date:hover:not(:disabled) {
  transform: scale(1.05);
}

.calendar-header button:hover {
  transform: scale(1.1);
}
</style>