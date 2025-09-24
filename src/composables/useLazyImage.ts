import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyImage(threshold = 0.1) {
  const imageRef = ref<HTMLImageElement | null>(null)
  const isLoaded = ref(false)
  const isInView = ref(false)

  let observer: IntersectionObserver | null = null

  const startObserving = () => {
    if (typeof window === 'undefined' || !imageRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView.value = true
            loadImage()
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    observer.observe(imageRef.value)
  }

  const loadImage = () => {
    if (!imageRef.value || isLoaded.value) return

    const img = imageRef.value
    const src = img.dataset.src

    if (src) {
      img.onload = () => {
        isLoaded.value = true
        img.classList.add('loaded')
      }
      img.onerror = () => {
        img.classList.add('error')
      }
      img.src = src
      img.removeAttribute('data-src')
    }
  }

  onMounted(() => {
    startObserving()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    imageRef,
    isLoaded,
    isInView
  }
}

export function useIntersectionObserver(
  target: HTMLElement | null,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  let observer: IntersectionObserver | null = null

  const startObserving = () => {
    if (typeof window === 'undefined' || !target) return

    observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(target)
  }

  const stopObserving = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    startObserving()
  })

  onUnmounted(() => {
    stopObserving()
  })

  return {
    startObserving,
    stopObserving
  }
}