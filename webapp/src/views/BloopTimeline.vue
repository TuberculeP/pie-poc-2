<template>
    <div class="bloop-timeline">
        <TimelineGrid :gridInterval="1" />
        <TrackList />
        <Playhead />
    </div>
</template>

<script setup lang="ts">
import TimelineGrid from '../../src/components/app/timeline/TimeLineGrid.vue';
import TrackList from '../../src/components/app/timeline/TrackList.vue';
import Playhead from '../../src/components/app/timeline/PlayHead.vue';
</script>

<style scoped>
.bloop-timeline {
    position: relative;
    overflow-x: auto;
    background: #fafafa;
}
</style>