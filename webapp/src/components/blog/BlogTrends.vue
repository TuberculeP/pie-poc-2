<script setup lang="ts">
import { ref } from "vue";

const tags = ref([
  "Music",
  "Song",
  "Artist",
  "Album",
  "Genre",
  "Playlist",
  "Concert",
  "Band",
  "Instrument",
  "Lyrics",
]);
</script>
<template>
  <div class="trends-container">
    <h2>Tendances</h2>
    <div class="trends-tags">
      <div class="trends-tag" v-for="tag in tags" :key="tag">{{ tag }}</div>
    </div>
  </div>
</template>
<style scoped>
.trends-container {
  background: var(--color-bg-primary-dark);
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: 16px;

  .trends-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .trends-tag {
    background: color-mix(in srgb, var(--color-primary) 20%, transparent);
    border: 1px solid var(--color-primary);
    color: var(--color-white);
    padding: 8px 16px;
    border-radius: 99px;
    margin-right: 8px;
    margin-bottom: 8px;
    width: fit-content;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .trends-tag:hover {
    box-shadow: 0 4px 16px rgba(0, 255, 136, 0.2);
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--color-primary) 30%, transparent);
    border-color: var(--color-accent);
  }
}
</style>
