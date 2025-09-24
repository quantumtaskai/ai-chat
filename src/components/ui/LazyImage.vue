<template>
  <div class="lazy-image-container" :class="containerClass">
    <img
      ref="imageRef"
      :data-src="src"
      :alt="alt"
      :class="[
        'lazy-image transition-all duration-300',
        imageClass,
        {
          'opacity-0': !isLoaded,
          'opacity-100': isLoaded,
          'blur-sm': !isLoaded,
          'blur-0': isLoaded
        }
      ]"
      :style="imageStyle"
    />

    <!-- Loading placeholder -->
    <div
      v-if="!isLoaded"
      class="absolute inset-0 bg-gray-100 animate-pulse rounded flex items-center justify-center"
    >
      <svg
        class="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLazyImage } from '@/composables/useLazyImage'

interface Props {
  src: string
  alt: string
  containerClass?: string
  imageClass?: string
  width?: string | number
  height?: string | number
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  imageClass: '',
  threshold: 0.1
})

const { imageRef, isLoaded } = useLazyImage(props.threshold)

const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateZ(0);
  will-change: transform, opacity;
}

.lazy-image.loaded {
  animation: fadeInImage 0.3s ease-out;
}

.lazy-image.error {
  opacity: 0.5;
  filter: grayscale(100%);
}

@keyframes fadeInImage {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>