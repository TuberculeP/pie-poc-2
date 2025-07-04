<template>
  <div class="note">
    {{ note.pitch }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  note: { i:string; pitch:string; start:number; duration:number }
}>()
</script>

<style scoped>
.note {
  width: 100%;
  height: 100%;
  background: #ffa000;
  border: 1px solid #ff8f00;
  border-radius: 2px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;
}
</style>
