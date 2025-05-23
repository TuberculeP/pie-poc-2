<script setup lang="ts">
import { UseDraggable, vResizeObserver } from "@vueuse/components";

import { useTemplateRef, ref } from "vue";

const handle = useTemplateRef("handle");

const isSubWindowActive = ref(false);

const emit = defineEmits<{
  (e: "resize", dimensions: { width: number; height: number }): void;
}>();

function onResizeObserver(entries: any) {
  const [entry] = entries;
  const { width, height } = entry.contentRect;
  emit("resize", { width, height });
}

function onActivatorClick() {
  isSubWindowActive.value = !isSubWindowActive.value;
  console.log("Activator clicked");
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
    v-resize-observer="onResizeObserver"
  >
    <div>
      <div ref="handle" class="header">👋 Drag here!</div>
      <div class="content">
        <slot />
      </div>
    </div>
  </UseDraggable>
</template>

<style scoped>
.subwindow {
  background-color: #fff;
  border: 1px solid #000;
  width: 200px;
  height: 200px;
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
}
</style>
