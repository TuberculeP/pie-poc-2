<script setup lang="ts">
import type { Track } from "../../../lib/utils/types";
import TrackHeader from "./TrackHeader.vue";
import TrackTimelinePreview from "./TrackTimelinePreview.vue";
import PianoRoll from "./PianoRoll/PianoRoll.vue";

defineProps<{
  track: Track;
  cols: number;
  colWidth: number;
  rowHeight: number;
  isExpanded: boolean;
  isActive?: boolean;
  playbackPosition: number;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-mute", track: Track): void;
  (e: "toggle-solo", track: Track): void;
  (e: "select-track", track: Track): void;
  (e: "rename-track", track: Track): void;
  (e: "delete-track", track: Track): void;
  (e: "open-settings", track: Track): void;
  (e: "toggle-expand", track: Track): void;
}>();
</script>

<template>
  <div
    class="track-row"
    :class="{ active: isActive, muted: track.muted, expanded: isExpanded }"
  >
    <TrackHeader
      :track="track"
      :is-active="isActive"
      :is-expanded="isExpanded"
      @toggle-mute="emit('toggle-mute', track)"
      @toggle-solo="emit('toggle-solo', track)"
      @select="emit('select-track', track)"
      @rename="emit('rename-track', track)"
      @open-settings="emit('open-settings', track)"
      @toggle-expand="emit('toggle-expand', track)"
    />

    <TrackTimelinePreview
      :notes="track.notes"
      :cols="cols"
      :col-width="colWidth"
      :row-height="rowHeight"
      :color="track.color"
      @dblclick="emit('toggle-expand', track)"
    />

    <PianoRoll
      v-if="isExpanded"
      :track="track"
      :cols="cols"
      :col-width="colWidth"
      :playback-position="playbackPosition"
      :is-playing="isPlaying"
    />
  </div>
</template>

<style scoped lang="scss">
.track-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-template-rows: auto auto;
  border-bottom: 1px solid rgba(122, 15, 62, 0.5);

  &.active :deep(.track-header) {
    background: #3d1528;
  }

  &.muted {
    opacity: 0.5;
  }

  &.expanded :deep(.track-header) {
    background: #3d1528;
  }
}

:deep(.track-header) {
  grid-column: 1;
  grid-row: 1;
}

:deep(.track-timeline) {
  grid-column: 2;
  grid-row: 1;
}

:deep(.piano-roll-wrapper) {
  grid-column: 1 / -1;
  grid-row: 2;
}
</style>
