<template>
  <div class="morph-shape" ref="shapeRef" :style="{ width: size + 'px', height: size + 'px' }">
    <div class="shape-inner" :class="currentShape"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type ShapeType = 'circle' | 'square' | 'hexagon' | 'diamond' | 'blob'

const props = withDefaults(
  defineProps<{
    size?: number
    fromShape?: ShapeType
    toShape?: ShapeType
    color?: string
    glowColor?: string
    scrub?: boolean | number
    triggerStart?: string
    triggerEnd?: string
  }>(),
  {
    size: 100,
    fromShape: 'circle',
    toShape: 'square',
    color: 'rgba(255, 210, 105, 0.3)',
    glowColor: 'rgba(255, 210, 105, 0.5)',
    scrub: 1,
    triggerStart: 'top 80%',
    triggerEnd: 'top 20%',
  },
)

const shapeRef = ref<HTMLElement | null>(null)
const currentShape = ref(props.fromShape)

const getClipPath = (shape: ShapeType) => {
  switch (shape) {
    case 'circle':
      return 'circle(50% at 50% 50%)'
    case 'square':
      return 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)'
    case 'hexagon':
      return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
    case 'blob':
      return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
    default:
      return 'circle(50% at 50% 50%)'
  }
}

const getBorderRadius = (shape: ShapeType) => {
  switch (shape) {
    case 'circle':
      return '50%'
    case 'square':
      return '8px'
    case 'hexagon':
      return '0%'
    case 'diamond':
      return '0%'
    case 'blob':
      return '30% 70% 70% 30% / 30% 30% 70% 70%'
    default:
      return '50%'
  }
}

onMounted(() => {
  if (!shapeRef.value) return

  const inner = shapeRef.value.querySelector('.shape-inner')
  if (!inner) return

  gsap.set(inner, {
    clipPath: getClipPath(props.fromShape),
    borderRadius: getBorderRadius(props.fromShape),
    backgroundColor: props.color,
    boxShadow: `0 0 30px ${props.glowColor}`,
  })

  const scrollTriggerConfig: ScrollTrigger.Vars = {
    trigger: shapeRef.value,
    start: props.triggerStart,
    end: props.triggerEnd,
  }

  if (props.scrub) {
    scrollTriggerConfig.scrub = props.scrub === true ? 1 : props.scrub
  }

  gsap.to(inner, {
    clipPath: getClipPath(props.toShape),
    borderRadius: getBorderRadius(props.toShape),
    rotation: 180,
    scale: 1.1,
    duration: 1,
    ease: 'power2.inOut',
    scrollTrigger: scrollTriggerConfig,
    onComplete: () => {
      currentShape.value = props.toShape
    },
  })
})
</script>

<style scoped>
.morph-shape {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-inner {
  width: 100%;
  height: 100%;
  will-change: clip-path, border-radius, transform;
  transition: box-shadow 0.3s ease;
}

.shape-inner:hover {
  box-shadow:
    0 0 50px var(--glow-color, rgba(255, 210, 105, 0.6)),
    0 0 100px var(--glow-color, rgba(255, 210, 105, 0.3));
}
</style>
