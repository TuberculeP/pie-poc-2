<template>
  <div class="ruler" :style="{ width: totalWidth + 'px' }">
    <div
      v-for="n in steps"
      :key="n"
      class="tick"
      :style="{ left: (n - 1) * stepWidth + 'px' }"
    >
      <div class="mark"></div>
      <span class="label">{{ n }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  steps: number      // nombre de mesures (ex. 4)
  stepWidth: number  // largeur d’une mesure en px
}>()

// calcule la largeur totale de la timeline
const totalWidth = computed(() => props.steps * props.stepWidth)
</script>

<style scoped>
.ruler {
  position: relative;
  height: 100%;
  background: #2d3b45;
  overflow: visible; 
}
.tick {
  position: absolute;
  top: 0; bottom: 0;
  width: 0;
}
.mark {
  position: absolute;
  left: 0; top: 0;
  width: 1px; height: 100%;
  background: #3f4a52;
}
.label {
  position: absolute;
  padding-left: 12px;
  top: 2px;
  left: 0;
  transform: translateX(-50%);
  font-size: 10px;
  color: #9aa5b1;
  user-select: none;
}
</style>
