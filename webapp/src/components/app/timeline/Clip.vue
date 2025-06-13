<template>
  <div
    class="clip"
    :style="{
      left: clip.start * scale + 'px',
      width: clip.duration * scale + 'px'
    }"
    @mousedown.prevent="onDragStart"
  >
    {{ clip.id }}
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import type { Clip as ClipType } from '../../../stores/timeline';

const props = defineProps<{ clip: ClipType; scale: number }>();
const emit = defineEmits<{
  (e: 'drag-start', clip: ClipType, event: MouseEvent): void;
}>();

function onDragStart(event: MouseEvent) {
  emit('drag-start', props.clip, event);
}
</script>

<style scoped>
.clip {
  position: absolute;
  top: 4px;
  height: 52px;
  background: #4caf50;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
}
</style>