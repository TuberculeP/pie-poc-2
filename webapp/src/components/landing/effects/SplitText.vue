<template>
  <component :is="tag" class="split-text" ref="textRef">
    <span v-for="(word, wordIndex) in words" :key="wordIndex" class="word">
      <span
        v-for="(char, charIndex) in word.split('')"
        :key="`${wordIndex}-${charIndex}`"
        class="char"
        :style="{ '--char-index': wordIndex * 10 + charIndex }"
      >
        {{ char }}
      </span>
      <span v-if="wordIndex < words.length - 1" class="char space">&nbsp;</span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(
  defineProps<{
    text: string
    tag?: string
    animationType?: 'fade' | 'slide' | 'rotate3d' | 'wave'
    duration?: number
    stagger?: number
    delay?: number
    triggerStart?: string
    scrub?: boolean | number
  }>(),
  {
    tag: 'span',
    animationType: 'rotate3d',
    duration: 0.8,
    stagger: 0.02,
    delay: 0,
    triggerStart: 'top 80%',
    scrub: false,
  },
)

const textRef = ref<HTMLElement | null>(null)

const words = computed(() => props.text.split(' '))

const getAnimationProps = () => {
  switch (props.animationType) {
    case 'fade':
      return {
        opacity: 0,
        y: 20,
      }
    case 'slide':
      return {
        opacity: 0,
        y: 50,
        x: -20,
      }
    case 'rotate3d':
      return {
        opacity: 0,
        y: 80,
        rotateX: -90,
        transformOrigin: 'top center',
      }
    case 'wave':
      return {
        opacity: 0,
        y: 30,
        scale: 0.5,
      }
    default:
      return {
        opacity: 0,
        y: 50,
      }
  }
}

const animate = () => {
  if (!textRef.value) return

  const chars = textRef.value.querySelectorAll('.char:not(.space)')

  gsap.set(chars, getAnimationProps())

  const scrollTriggerConfig: ScrollTrigger.Vars = {
    trigger: textRef.value,
    start: props.triggerStart,
  }

  if (props.scrub) {
    scrollTriggerConfig.scrub = props.scrub === true ? 1 : props.scrub
    scrollTriggerConfig.end = 'top 30%'
  }

  gsap.to(chars, {
    opacity: 1,
    y: 0,
    x: 0,
    rotateX: 0,
    scale: 1,
    duration: props.duration,
    stagger: props.stagger,
    delay: props.delay,
    ease: 'back.out(1.7)',
    scrollTrigger: scrollTriggerConfig,
  })
}

onMounted(() => {
  animate()
})

watch(
  () => props.text,
  () => {
    ScrollTrigger.refresh()
    animate()
  },
)
</script>

<style scoped>
.split-text {
  display: inline;
  perspective: 1000px;
}

.word {
  display: inline-block;
  white-space: nowrap;
}

.char {
  display: inline-block;
  will-change: transform, opacity;
  backface-visibility: hidden;
}
</style>
