import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import type { AnimationConfig } from "../types/landing";

const defaultConfig: AnimationConfig = {
  duration: 0.8,
  delay: 0.1,
  stagger: 0.05,
  ease: "power3.out",
};

export function useHeroAnimations() {
  const heroRef = ref<HTMLElement | null>(null);
  const heroBadgeRef = ref<HTMLElement | null>(null);
  const heroTitleRef = ref<HTMLElement | null>(null);
  const heroDescRef = ref<HTMLElement | null>(null);
  const heroStatsRef = ref<HTMLElement | null>(null);
  const heroActionsRef = ref<HTMLElement | null>(null);
  const heroVisualRef = ref<HTMLElement | null>(null);

  const animateHeroEntrance = (config: AnimationConfig = {}) => {
    const finalConfig = { ...defaultConfig, ...config };

    // Badge animation
    if (heroBadgeRef.value) {
      gsap.from(heroBadgeRef.value, {
        opacity: 0,
        y: -20,
        duration: finalConfig.duration,
        delay: finalConfig.delay,
        ease: finalConfig.ease,
      });
    }

    // Title animation
    if (heroTitleRef.value) {
      gsap.from(heroTitleRef.value, {
        opacity: 0,
        y: 30,
        duration: finalConfig.duration,
        delay: (finalConfig.delay || 0) + 0.1,
        ease: finalConfig.ease,
      });
    }

    // Description animation
    if (heroDescRef.value) {
      gsap.from(heroDescRef.value, {
        opacity: 0,
        y: 20,
        duration: finalConfig.duration,
        delay: (finalConfig.delay || 0) + 0.2,
        ease: finalConfig.ease,
      });
    }

    // Stats animation
    if (heroStatsRef.value) {
      gsap.from(heroStatsRef.value, {
        opacity: 0,
        y: 20,
        duration: finalConfig.duration,
        delay: (finalConfig.delay || 0) + 0.3,
        ease: finalConfig.ease,
      });
    }

    // Actions animation
    if (heroActionsRef.value) {
      gsap.from(heroActionsRef.value, {
        opacity: 0,
        y: 20,
        duration: finalConfig.duration,
        delay: (finalConfig.delay || 0) + 0.4,
        ease: finalConfig.ease,
      });
    }

    // Visual animation (3D effect)
    if (heroVisualRef.value) {
      gsap.from(heroVisualRef.value, {
        opacity: 0,
        rotateY: -20,
        duration: finalConfig.duration,
        delay: (finalConfig.delay || 0) + 0.2,
        ease: finalConfig.ease,
      });
    }
  };

  const animateMockup = (mockupRef: HTMLElement | null) => {
    if (!mockupRef) return;

    gsap.from(mockupRef, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
    });
  };

  onMounted(() => {
    animateHeroEntrance();
  });

  return {
    heroRef,
    heroBadgeRef,
    heroTitleRef,
    heroDescRef,
    heroStatsRef,
    heroActionsRef,
    heroVisualRef,
    animateHeroEntrance,
    animateMockup,
  };
}
