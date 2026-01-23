<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from "vue";
// import { useLenis } from '../composables/useLenis'
import { useGsap } from "../composables/useGsap";
import ParallaxContainer from "../components/landing/parallax/ParallaxContainer.vue";

const isLoaded = ref(false);
const scrollProgress = ref(0);

// Désactivé temporairement pour tester le scroll natif
// const { lenis, scrollTo } = useLenis()
const lenis = ref(null);
const scrollTo = (target: string | number | HTMLElement) => {
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
const { gsap } = useGsap();

provide("lenis", lenis);
provide("scrollTo", scrollTo);

const updateScrollProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
};

onMounted(() => {
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  setTimeout(() => {
    isLoaded.value = true;
  }, 100);

  gsap.to(".landing-layout", {
    scrollTrigger: {
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollProgress);
});
</script>

<template>
  <div class="landing-layout" :class="{ loaded: isLoaded }">
    <!-- Global scroll progress indicator -->
    <div
      class="scroll-progress-bar"
      :style="{ width: scrollProgress + '%' }"
    ></div>

    <!-- Parallax background with all layers -->
    <ParallaxContainer>
      <!-- Page content -->
      <div class="layout-content">
        <slot />
      </div>
    </ParallaxContainer>

    <!-- Scroll indicator (only on first screen) -->
    <div class="scroll-indicator" :class="{ hidden: scrollProgress > 5 }">
      <div class="scroll-mouse">
        <div class="scroll-wheel"></div>
      </div>
      <span class="scroll-text">Scroll</span>
    </div>
  </div>
</template>

<style scoped>
.landing-layout {
  position: relative;
  min-height: 100vh;
  font-family:
    var(--font-body),
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  color: var(--color-white);
  overflow: visible;
  background: #060b17;
}

/* Scroll progress bar */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-accent),
    var(--color-secondary)
  );
  z-index: 9999;
  transition: width 0.1s linear;
  box-shadow: 0 0 10px var(--color-accent);
}

/* Content wrapper */
.layout-content {
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.landing-layout.loaded .layout-content {
  opacity: 1;
  transform: translateY(0);
}

/* Scroll indicator */
.scroll-indicator {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 50;
  opacity: 1;
  transition: opacity 0.5s ease;
}

.scroll-indicator.hidden {
  opacity: 0;
  pointer-events: none;
}

.scroll-mouse {
  width: 26px;
  height: 40px;
  border: 2px solid rgba(255, 210, 105, 0.5);
  border-radius: 13px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.scroll-wheel {
  width: 4px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 2px;
  animation: scroll-wheel 1.5s ease-in-out infinite;
}

@keyframes scroll-wheel {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(8px);
    opacity: 0.3;
  }
}

.scroll-text {
  font-size: 12px;
  color: rgba(255, 210, 105, 0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Lenis smooth scroll styles */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(6, 11, 23, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 210, 105, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 210, 105, 0.5);
}

/* Selection styling */
::selection {
  background: rgba(255, 210, 105, 0.3);
  color: var(--color-white);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .scroll-indicator {
    bottom: 20px;
  }

  .scroll-progress-bar {
    height: 2px;
  }
}
</style>
