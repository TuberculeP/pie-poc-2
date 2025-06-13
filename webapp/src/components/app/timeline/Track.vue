<template>
	<div class="track">
		<div class="track-name">{{ track.name }}</div>
		<div class="clips">
			<Clip
			v-for="clip in trackClips"
			:key="clip.id"
			:clip="clip"
			:scale="1"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Track as TrackType } from '../../../stores/timeline';
import { useTimelineStore } from '../../../stores/timeline';
import Clip from './Clip.vue';

const props = defineProps<{ track: TrackType }>();
const store = useTimelineStore();
const trackClips = computed(() => store.clips.filter(c => c.trackId === props.track.id));
</script>

<style scoped>
.track {
	display: flex;
	height: 60px;
	border-bottom: 1px solid #eee;
}
.track-name {
	width: 100px;
	padding: 4px;
}
.clips {
	flex: 1;
	position: relative;
}
</style>