<script setup lang="ts">
import BloopBasicSynth from "../../components/app/instruments/BloopBasicSynth.vue";
import BloopSubWindow from "../../components/app/BloopSubWindow.vue";
import { useMainStore } from "../../stores/mainStore";
import BloopElementarySynth from "../../components/app/instruments/BloopElementarySynth.vue";
import { storeToRefs } from "pinia";
import BloopSmplr from "../../components/app/instruments/BloopSmplr.vue";

const mainStore = useMainStore();
const { isLoaded, loadPercentage } = storeToRefs(mainStore);
const { loadAll } = mainStore;
</script>

<template>
  <div>
    <h1>App</h1>
    <p>App loading current state : {{ loadPercentage }}%</p>
    <button @click="loadAll">Start app</button>
    <div v-if="isLoaded">
      <BloopSubWindow>
        <template #activator="{ active }">
          <button :class="{ active }">Basic</button>
        </template>
        <BloopBasicSynth />
      </BloopSubWindow>
      <BloopSubWindow>
        <template #activator="{ active }">
          <button :class="{ active }">Elementary</button>
        </template>
        <BloopElementarySynth />
      </BloopSubWindow>
      <BloopSubWindow>
        <template #activator="{ active }">
          <button :class="{ active }">Smplr</button>
        </template>
        <BloopSmplr />
      </BloopSubWindow>
    </div>
  </div>
</template>

<style scoped>
button {
  &.active {
    background-color: red;
  }
}
</style>
