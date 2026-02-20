import { onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLandingScroll() {
  const registerScrollAnimation = (
    element: HTMLElement | null,
    options?: {
      from?: gsap.TweenVars;
      to?: gsap.TweenVars;
      triggerOptions?: gsap.ScrollTriggerStaticVars;
    },
  ) => {
    if (!element) return;

    const defaultFrom = {
      opacity: 0,
      y: 50,
    };

    const defaultTo = {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    };

    const triggerOptions = {
      trigger: element,
      start: "top 80%",
      end: "top 50%",
      scrub: false,
      ...options?.triggerOptions,
    };

    gsap.fromTo(element, options?.from || defaultFrom, {
      ...defaultTo,
      ...options?.to,
      scrollTrigger: triggerOptions,
    });
  };

  const registerStaggerAnimation = (
    elements: HTMLElement[],
    options?: {
      stagger?: number;
      triggerOptions?: gsap.ScrollTriggerStaticVars;
    },
  ) => {
    if (!elements || elements.length === 0) return;

    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: options?.stagger || 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elements[0],
          start: "top 80%",
          end: "top 50%",
          ...options?.triggerOptions,
        },
      },
    );
  };

  const registerCountUpAnimation = (
    element: HTMLElement | null,
    targetValue: number,
    options?: {
      duration?: number;
      triggerOptions?: gsap.ScrollTriggerStaticVars;
    },
  ) => {
    if (!element) return;

    const counter = { value: 0 };

    gsap.to(counter, {
      value: targetValue,
      duration: options?.duration || 2,
      ease: "power2.out",
      onUpdate: () => {
        element.innerText = Math.floor(counter.value).toLocaleString();
      },
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        once: true,
        ...options?.triggerOptions,
      },
    });
  };

  const killAllScrollTriggers = () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };

  onUnmounted(() => {
    killAllScrollTriggers();
  });

  return {
    registerScrollAnimation,
    registerStaggerAnimation,
    registerCountUpAnimation,
    killAllScrollTriggers,
  };
}
