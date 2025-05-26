<template>
  <div
    class="potentiometer"
    :class="{ dragging }"
    :style="computedStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div class="dot"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const bitRotation = defineModel<number>({ default: 0 });

const startY = ref(0);
const startValue = ref(0);
const dragging = ref(false);

const computedStyle = computed(() => {
  const angle = (bitRotation.value / 127) * 300 + 30;
  return {
    transform: `rotate(${angle}deg)`,
  };
});

function onDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return;
  const clientY =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  const delta = startY.value - clientY;
  let newValue = startValue.value + delta;
  newValue = Math.max(0, Math.min(127, newValue));
  bitRotation.value = newValue;
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchmove", onDrag);
  window.removeEventListener("touchend", stopDrag);
}

function startDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true;
  startY.value =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
  startValue.value = bitRotation.value;
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchmove", onDrag);
  window.addEventListener("touchend", stopDrag);
}
</script>

<style scoped>
.potentiometer {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgb(48, 48, 48);
  position: relative;
  cursor: pointer;
  user-select: none;
  &.dragging {
    cursor: grabbing;
    background-color: black;
  }
  .dot {
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translate(-50%, 0%);
  }
}
</style>
