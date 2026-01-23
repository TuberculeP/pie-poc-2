import { onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

export function useGsap() {
  onMounted(() => {
    if (!isRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      isRegistered = true;
    }

    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });

    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });
  });

  onUnmounted(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });

  const createScrollAnimation = (
    target: gsap.TweenTarget,
    vars: gsap.TweenVars,
    triggerOptions: ScrollTrigger.Vars,
  ) => {
    return gsap.to(target, {
      ...vars,
      scrollTrigger: {
        ...triggerOptions,
      },
    });
  };

  const createTimeline = (triggerOptions?: ScrollTrigger.Vars) => {
    return gsap.timeline({
      scrollTrigger: triggerOptions,
    });
  };

  const prefersReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  return {
    gsap,
    ScrollTrigger,
    createScrollAnimation,
    createTimeline,
    prefersReducedMotion,
  };
}
