<template>
    <div class="playhead" :style="{ left: playhead * scale + 'px' }"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimelineStore } from '../../../stores/timeline';

const store = useTimelineStore();
const playhead = computed(() => store.playhead);
const scale = 100; // TODO: rendre configurable
</script>

<style scoped>
.playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: red;
    pointer-events: none;
}
</style>