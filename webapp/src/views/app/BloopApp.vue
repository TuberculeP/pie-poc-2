<script setup lang="ts">
import BloopSubWindow from "../../components/app/BloopSubWindow.vue";
</script>

<template>
  <div>
    <h1>App</h1>
    <BloopSubWindow>
      <template #activator="{ active }">
        <button :class="{ active }">Test Sub window</button>
      </template>
      <h1>Content</h1>
    </BloopSubWindow>
  </div>
</template>

<style scoped>
button {
  &.active {
    background-color: red;
  }
}
</style>
