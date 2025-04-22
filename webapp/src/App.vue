<script setup lang="ts">
import { ref } from "vue";

const test = ref(0);
</script>

<template>
  <h1>Webapp</h1>
  <button @click="test++">{{ test }}</button>
</template>
