<template>
  <span class="count-up" ref="countRef">
    {{ prefix }}{{ displayValue }}{{ suffix }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const props = withDefaults(
  defineProps<{
    target: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    separator?: string;
    triggerStart?: string;
  }>(),
  {
    duration: 2,
    prefix: "",
    suffix: "",
    decimals: 0,
    separator: "",
    triggerStart: "top 80%",
  },
);

const countRef = ref<HTMLElement | null>(null);
const currentValue = ref(0);

const displayValue = ref("0");

const formatNumber = (num: number) => {
  const fixed = num.toFixed(props.decimals);
  if (!props.separator) return fixed;

  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, props.separator);
  return parts.join(".");
};

const animate = () => {
  if (!countRef.value) return;

  gsap.to(currentValue, {
    value: props.target,
    duration: props.duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: countRef.value,
      start: props.triggerStart,
      once: true,
    },
    onUpdate: () => {
      displayValue.value = formatNumber(currentValue.value);
    },
  });
};

onMounted(() => {
  displayValue.value = formatNumber(0);
  animate();
});

watch(
  () => props.target,
  () => {
    ScrollTrigger.refresh();
    currentValue.value = 0;
    animate();
  },
);
</script>

<style scoped>
.count-up {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  will-change: contents;
}
</style>
