<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { AudioClip } from "../../../lib/utils/types";
import { useAudioLibraryStore } from "../../../stores/audioLibraryStore";

const props = defineProps<{
  clips: AudioClip[];
  cols: number;
  colWidth: number;
  rowHeight: number;
  color: string;
}>();

const emit = defineEmits<{
  (e: "dblclick"): void;
}>();

const audioLibraryStore = useAudioLibraryStore();

onMounted(() => {
  audioLibraryStore.initialize();
});

const gridStyle = computed(() => ({
  width: `${props.cols * props.colWidth}px`,
  height: `${props.rowHeight}px`,
}));

const getClipStyle = (clip: AudioClip) => ({
  left: `${clip.x * props.colWidth}px`,
  width: `${Math.max(clip.w * props.colWidth - 2, 4)}px`,
  height: `${props.rowHeight - 8}px`,
  top: "4px",
  backgroundColor: props.color,
});

const getWaveformData = (clip: AudioClip): number[] => {
  const sample = audioLibraryStore.getSample(clip.sampleId);
  return sample?.waveformData ?? [];
};

const renderWaveform = (clip: AudioClip): string => {
  const data = getWaveformData(clip);
  if (data.length === 0) return "";

  const clipWidth = Math.max(clip.w * props.colWidth - 4, 4);
  const height = props.rowHeight - 12;
  const midY = height / 2;

  const points = data.map((v, i) => {
    const x = (i / data.length) * clipWidth;
    const y = midY - v * midY * 0.8;
    return `${x},${y}`;
  });

  const pointsReverse = data
    .map((v, i) => {
      const x = (i / data.length) * clipWidth;
      const y = midY + v * midY * 0.8;
      return `${x},${y}`;
    })
    .reverse();

  return [...points, ...pointsReverse].join(" ");
};
</script>

<template>
  <div class="track-timeline" :style="gridStyle" @dblclick="emit('dblclick')">
    <div class="grid-lines">
      <div
        v-for="i in Math.ceil(cols / 4)"
        :key="i"
        class="measure-line"
        :style="{ left: `${(i - 1) * 4 * colWidth}px` }"
      />
    </div>
    <div class="clips-preview">
      <div
        v-for="clip in clips"
        :key="clip.id"
        class="clip-preview"
        :style="getClipStyle(clip)"
      >
        <svg
          v-if="getWaveformData(clip).length > 0"
          class="waveform-svg"
          :viewBox="`0 0 ${Math.max(clip.w * colWidth - 4, 4)} ${rowHeight - 12}`"
          preserveAspectRatio="none"
        >
          <polygon :points="renderWaveform(clip)" fill="rgba(255,255,255,0.4)" />
        </svg>
        <div v-else class="clip-placeholder" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.track-timeline {
  position: relative;
  background: #1a0e15;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background: #1f1119;
  }
}

.grid-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.measure-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(122, 15, 62, 0.5);
}

.clips-preview {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.clip-preview {
  position: absolute;
  border-radius: 3px;
  opacity: 0.9;
  pointer-events: none;
  overflow: hidden;
}

.waveform-svg {
  width: 100%;
  height: 100%;
}

.clip-placeholder {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );
}
</style>
