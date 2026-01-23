import { ref, onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null
let animationFrameId: number | null = null

export function useLenis() {
  const lenis = ref<Lenis | null>(null)

  const raf = (time: number) => {
    lenisInstance?.raf(time)
    animationFrameId = requestAnimationFrame(raf)
  }

  onMounted(() => {
    // Éviter les instances multiples
    if (lenisInstance) {
      lenis.value = lenisInstance
      return
    }

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    lenis.value = lenisInstance

    // Connecter Lenis à ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update)

    // Utiliser requestAnimationFrame natif
    animationFrameId = requestAnimationFrame(raf)

    // Rafraîchir ScrollTrigger quand la page est chargée
    ScrollTrigger.refresh()
  })

  onUnmounted(() => {
    lenis.value = null
  })

  const scrollTo = (target: string | number | HTMLElement, options?: object) => {
    lenis.value?.scrollTo(target, options)
  }

  const stop = () => {
    lenis.value?.stop()
  }

  const start = () => {
    lenis.value?.start()
  }

  return {
    lenis,
    scrollTo,
    stop,
    start,
  }
}

// Fonction pour détruire complètement Lenis (à appeler au démontage de l'app)
export function destroyLenis() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }
}
