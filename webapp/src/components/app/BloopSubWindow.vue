<script setup lang="ts">
import { UseDraggable, vResizeObserver } from "@vueuse/components";
import { useTemplateRef, ref, computed } from "vue";

const emit = defineEmits<{
  (e: "resize", dimensions: { width: number; height: number }): void;
}>();

const handle = useTemplateRef("handle");
const currentSize = ref({ width: 0, height: 0 });
const isFullScreen = ref(false);

const isSubWindowActive = ref(false);

const computedStyle = computed(() => {
  if (!isFullScreen.value) {
    return "";
  }
  return {
    top: "0px",
    left: "0px",
    width: "100vw",
    height: "100vh",
  };
});

function onResizeObserver(entries: any) {
  if (isFullScreen.value) return;

  const [entry] = entries;
  const { width, height } = entry.contentRect;
  currentSize.value = { width, height };
  emit("resize", { width, height });
}

function onActivatorClick() {
  isSubWindowActive.value = !isSubWindowActive.value;
}

function toggleFullscreen() {
  isFullScreen.value = !isFullScreen.value;
}
</script>

<template>
  <div @click="onActivatorClick">
    <slot name="activator" :active="isSubWindowActive">
      <button>Ouvrir</button>
    </slot>
  </div>

  <UseDraggable
    v-if="isSubWindowActive"
    class="subwindow"
    :prevent-default="true"
    :handle="handle"
    :style="computedStyle"
    v-resize-observer="onResizeObserver"
  >
    <div ref="handle" class="header" @dblclick="toggleFullscreen">
      👋 Drag here!
    </div>
    <div class="content">
      <slot />
    </div>
  </UseDraggable>
</template>

<style scoped lang="scss">
.subwindow {
  background-color: #fff;
  border: 1px solid #000;
  min-width: 200px;
  min-height: 200px;
  position: fixed;
  z-index: 500;
  resize: both;
  overflow: scroll;

  .header,
  .content {
    padding: 10px;
  }

  .header {
    background-color: #ccc;
    padding: 5px;
    cursor: move;
  }

  .content {
    width: 100%;
    height: 100%;
    :deep(iframe) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
