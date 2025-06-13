<template>
  <div class="timeline-grid">
    <!-- TODO: afficher les marques temporelles et la grille -->
  </div>
</template>

<script setup lang="ts">
// Props éventuelles, ex. intervalle de grille
defineProps<{ gridInterval: number }>();
</script>

<style scoped>
.timeline-grid {
		position: relative;
		height: 40px;
		border-bottom: 1px solid #ccc;
}
</style>