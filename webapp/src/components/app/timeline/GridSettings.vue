<template>
  <div class="grid-settings">
    <label>
      Largeur d’une maille : {{ stepWidth }}px
      <input type="range" min="20" max="100" v-model="localStep" />
    </label>
    <label>
      Hauteur d’une maille : {{ rowHeight }}px
      <input type="range" min="16" max="64" v-model="localRow" />
    </label>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, watch, ref } from 'vue'

const props = defineProps<{
  stepWidth: number
  rowHeight: number
}>()
const emitUpdate = defineEmits<{
  (e: 'update:stepWidth', val: number): void
  (e: 'update:rowHeight', val: number): void
}>()

const localStep = ref(props.stepWidth)
const localRow  = ref(props.rowHeight)

watch(localStep, val => emitUpdate('update:stepWidth', val))
watch(localRow,  val => emitUpdate('update:rowHeight',  val))
</script>

<style scoped>
.grid-settings {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;
  background: #2a2a2a;
  color: #eee;
}
label {
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
input[type="range"] {
  width: 120px;
}
</style>
