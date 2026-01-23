import { ref, onMounted, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export interface ParallaxLayer {
  element: HTMLElement
  speed: number
  depth: number
}

export function useParallax(containerRef: Ref<HTMLElement | null>) {
  const layers = ref<ParallaxLayer[]>([])

  const addLayer = (element: HTMLElement, speed: number, depth: number = 0) => {
    layers.value.push({ element, speed, depth })

    gsap.to(element, {
      y: () => speed * ScrollTrigger.maxScroll(window) * 0.3,
      ease: 'none',
      scrollTrigger: {
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    })
  }

  const addMouseParallax = (element: HTMLElement, intensity: number = 0.05) => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const xPos = (clientX / innerWidth - 0.5) * intensity * 100
      const yPos = (clientY / innerHeight - 0.5) * intensity * 100

      gsap.to(element, {
        x: xPos,
        y: yPos,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    onMounted(() => {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }

  const create3DRotation = (element: HTMLElement, intensity: number = 10) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  return {
    layers,
    addLayer,
    addMouseParallax,
    create3DRotation,
  }
}
