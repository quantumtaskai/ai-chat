export interface CalendarDate {
  date: Date
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isAvailable: boolean
  isWeekend: boolean
  isPast: boolean
}

export interface CalendarMonth {
  month: number
  year: number
  dates: CalendarDate[]
}

export interface AvailabilitySlot {
  time: string
  available: boolean
  booked?: boolean
}

export interface CalendarAvailability {
  date: string // YYYY-MM-DD format
  slots: AvailabilitySlot[]
  isAvailable: boolean
}

export interface CalendarConfig {
  minDate?: Date
  maxDate?: Date
  disabledDates?: string[]
  businessHours: {
    start: number // 9 for 9 AM
    end: number // 17 for 5 PM
    interval: number // 30 for 30 minutes
  }
  workingDays: number[] // [1,2,3,4,5,6] for Mon-Sat (0=Sunday)
  timezone: string // 'Asia/Dubai'
}

export interface CalendarEvent {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  attendees: string[]
  organizer: {
    name: string
    email: string
  }
}

export interface ICSOptions {
  filename?: string
  method?: 'REQUEST' | 'PUBLISH' | 'CANCEL'
}