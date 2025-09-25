import type { CalendarDate, CalendarMonth, CalendarConfig, CalendarEvent, ICSOptions } from '@/types/calendar'

export class CalendarUtils {
  private config: CalendarConfig

  constructor(config: CalendarConfig) {
    this.config = config
  }

  /**
   * Generate calendar month data with availability
   */
  generateMonth(year: number, month: number, selectedDate?: Date): CalendarMonth {
    const dates: CalendarDate[] = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()

    // Get first day of week (0 = Sunday)
    const startOfCalendar = new Date(firstDay)
    startOfCalendar.setDate(firstDay.getDate() - firstDay.getDay())

    // Generate 42 days (6 weeks × 7 days)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfCalendar)
      date.setDate(startOfCalendar.getDate() + i)

      const calendarDate: CalendarDate = {
        date: new Date(date),
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDate(date, today),
        isSelected: selectedDate ? this.isSameDate(date, selectedDate) : false,
        isWeekend: date.getDay() === 0, // Sunday is disabled
        isPast: date < today && !this.isSameDate(date, today),
        isAvailable: this.isDateAvailable(date)
      }

      dates.push(calendarDate)
    }

    return {
      month,
      year,
      dates
    }
  }

  /**
   * Check if a date is available for booking
   */
  private isDateAvailable(date: Date): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Past dates not available
    if (date < today) return false

    // Sundays not available (day 0)
    if (date.getDay() === 0) return false

    // Check against min/max dates
    if (this.config.minDate && date < this.config.minDate) return false
    if (this.config.maxDate && date > this.config.maxDate) return false

    // Check working days
    if (!this.config.workingDays.includes(date.getDay())) return false

    return true
  }

  /**
   * Generate available time slots for a given date
   */
  generateTimeSlots(date: Date): string[] {
    if (!this.isDateAvailable(date)) return []

    const slots: string[] = []
    const { start, end, interval } = this.config.businessHours

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }

    return slots
  }

  /**
   * Get month name
   */
  getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return monthNames[month]
  }

  /**
   * Get day names for calendar header
   */
  getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDateString(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Navigate to previous/next month
   */
  navigateMonth(currentYear: number, currentMonth: number, direction: 'prev' | 'next'): { year: number, month: number } {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        return { year: currentYear - 1, month: 11 }
      }
      return { year: currentYear, month: currentMonth - 1 }
    } else {
      if (currentMonth === 11) {
        return { year: currentYear + 1, month: 0 }
      }
      return { year: currentYear, month: currentMonth + 1 }
    }
  }
}

/**
 * Generate ICS (iCalendar) file content
 */
export function generateICSFile(event: CalendarEvent, options: ICSOptions = {}): string {
  const startDate = event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const endDate = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Chat Template//Meeting Scheduler//EN',
    `METHOD:${options.method || 'REQUEST'}`,
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    `ORGANIZER;CN=${escapeICSText(event.organizer.name)}:MAILTO:${event.organizer.email}`,
    ...event.attendees.map(email => `ATTENDEE;ROLE=REQ-PARTICIPANT:MAILTO:${email}`),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Download ICS file
 */
export function downloadICSFile(event: CalendarEvent, options: ICSOptions = {}): void {
  const icsContent = generateICSFile(event, options)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const filename = options.filename || `meeting-${event.startDate.getTime()}.ics`

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  URL.revokeObjectURL(link.href)
}

/**
 * Simple function to open OS calendar app (no event data)
 */
export function openOSCalendar(): void {
  const platform = detectPlatform()

  try {
    // Platform-specific calendar protocols
    switch (platform) {
      case 'windows':
        // Windows Calendar app
        window.open('outlookcal:', '_self')
        break
      case 'macos':
        // macOS Calendar app
        window.open('calshow:', '_self')
        break
      case 'ios':
        // iOS Calendar app
        window.open('calshow:', '_self')
        break
      case 'android':
        // Android Calendar app
        window.open('content://com.android.calendar/', '_self')
        break
      default:
        // Fallback: try to open a web calendar
        window.open('https://calendar.google.com', '_blank')
        break
    }

    // Track calendar opening
    window.dispatchEvent(new CustomEvent('analytics-event', {
      detail: {
        type: 'os_calendar_opened',
        data: { platform }
      }
    }))
  } catch (error) {
    console.error('Failed to open OS calendar:', error)
    // Ultimate fallback
    window.open('https://calendar.google.com', '_blank')
  }
}

/**
 * Open system calendar with event details
 * Universal function that works across all platforms
 */
export function openSystemCalendar(event: CalendarEvent): void {
  try {
    const icsContent = generateICSFile(event)

    // Method 1: Try data URL approach (works on most modern browsers)
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`

    // Create a temporary link and click it
    const tempLink = document.createElement('a')
    tempLink.href = dataUrl
    tempLink.download = `meeting-${event.startDate.getTime()}.ics`

    // Try to open with system calendar first
    try {
      tempLink.target = '_blank'
      tempLink.click()

      // Track successful calendar opening
      trackCalendarOpen('system_calendar', true)
    } catch (error) {
      // Fallback: Force download if direct opening fails
      tempLink.target = '_self'
      tempLink.click()

      trackCalendarOpen('system_calendar_fallback', false)
    }

  } catch (error) {
    console.error('Failed to open system calendar:', error)

    // Ultimate fallback: try Google Calendar web
    const googleUrl = generateCalendarURLs(event).google
    window.open(googleUrl, '_blank')

    trackCalendarOpen('google_fallback', false)
  }
}

/**
 * Detect user's platform for optimized calendar opening
 */
export function detectPlatform(): string {
  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios'
  } else if (userAgent.includes('android')) {
    return 'android'
  } else if (userAgent.includes('mac')) {
    return 'macos'
  } else if (userAgent.includes('win')) {
    return 'windows'
  } else {
    return 'unknown'
  }
}

/**
 * Track calendar opening events for analytics
 */
function trackCalendarOpen(method: string, successful: boolean): void {
  window.dispatchEvent(new CustomEvent('analytics-event', {
    detail: {
      type: 'system_calendar_opened',
      data: {
        method,
        successful,
        platform: detectPlatform(),
        timestamp: new Date().toISOString()
      }
    }
  }))
}

/**
 * Generate calendar provider URLs
 */
export function generateCalendarURLs(event: CalendarEvent): Record<string, string> {
  const startTime = event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const endTime = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startTime}/${endTime}`,
    details: event.description,
    location: event.location
  })

  const outlookParams = new URLSearchParams({
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    body: event.description,
    location: event.location
  })

  const yahooParams = new URLSearchParams({
    v: '60',
    title: event.title,
    st: startTime,
    et: endTime,
    desc: event.description,
    in_loc: event.location
  })

  return {
    google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`,
    yahoo: `https://calendar.yahoo.com/?${yahooParams.toString()}`
  }
}

/**
 * Helper functions
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@aichattemplate.com`
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

/**
 * Default calendar configuration template
 */
export const defaultCalendarConfig: CalendarConfig = {
  businessHours: {
    start: 9,  // 9 AM
    end: 17,   // 5 PM
    interval: 30 // 30 minutes
  },
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday (0=Sunday)
  timezone: 'Asia/Dubai',
  minDate: new Date(), // Today
  maxDate: (() => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 60) // 60 days from now
    return maxDate
  })()
}