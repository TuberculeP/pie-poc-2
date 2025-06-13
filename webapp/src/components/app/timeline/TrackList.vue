<template>
		<div class="track-list">
			<Track
				v-for="track in tracks"
				:key="track.id"
				:track="track"
			/>
		</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimelineStore } from '../../../stores/timeline';
import Track from './Track.vue';

const store = useTimelineStore();
const tracks = computed(() => store.tracks);
</script>

<style scoped>
.track-list {
  display: flex;
  flex-direction: column;
}
</style>