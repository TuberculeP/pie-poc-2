<template>
  <div class="sidebar">
    <div
      v-for="(key, idx) in keys"
      :key="key"
      class="key-row"
      :style="{ height: rowHeight + 'px' }"
    >
      {{ key }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  keys: string[]
  rowHeight: number
}>()
</script>

<style scoped>
.sidebar {
  background: #2d3b45;
  color: #e0e0e0;
  overflow-y: auto;
}
.key-row {
  display: flex;
  align-items: center;
  padding-left: 8px;
  border-bottom: 1px solid #3f4a52;
  font-size: 12px;
  user-select: none;
}
</style>
