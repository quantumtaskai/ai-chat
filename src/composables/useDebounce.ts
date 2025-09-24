import { ref, watch } from 'vue'

export function useDebounce<T>(value: T, delay: number) {
  const debouncedValue = ref<T>(value)

  watch(
    () => value,
    (newValue) => {
      const timeout = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)

      return () => clearTimeout(timeout)
    },
    { immediate: true }
  )

  return debouncedValue
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>): void => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(this, args)
    }
  }
}