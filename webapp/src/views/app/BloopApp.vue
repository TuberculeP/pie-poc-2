<script setup lang="ts">
import { onBeforeMount } from "vue";
import BloopBasicSynth from "../../components/app/instruments/BloopBasicSynth.vue";
import BloopSubWindow from "../../components/app/BloopSubWindow.vue";

import { useMIDIStore } from "../../stores/MIDIStore.ts";
const { initializeMIDI } = useMIDIStore();

onBeforeMount(() => {
  initializeMIDI();
});
</script>

<template>
  <div>
    <h1>App</h1>
    <BloopSubWindow>
      <template #activator="{ active }">
        <button :class="{ active }">Test Sub window</button>
      </template>
      <BloopBasicSynth />
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
