<script setup lang="ts">
import type { Track } from "../../../lib/utils/types";

const props = defineProps<{
  track: Track;
  isActive?: boolean;
  isExpanded: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-mute"): void;
  (e: "toggle-solo"): void;
  (e: "select"): void;
  (e: "rename"): void;
  (e: "open-settings"): void;
  (e: "toggle-expand"): void;
}>();

const headerStyle = { borderLeftColor: props.track.color };
</script>

<template>
  <div class="track-header" :style="headerStyle" @click="emit('select')">
    <div class="track-info">
      <span class="track-name" @dblclick.stop="emit('rename')">
        {{ track.name }}
      </span>
      <div class="track-controls">
        <button
          class="control-btn mute-btn"
          :class="{ active: track.muted }"
          @click.stop="emit('toggle-mute')"
          title="Mute"
        >
          M
        </button>
        <button
          class="control-btn solo-btn"
          :class="{ active: track.solo }"
          @click.stop="emit('toggle-solo')"
          title="Solo"
        >
          S
        </button>
        <button
          class="control-btn settings-btn"
          @click.stop="emit('open-settings')"
          title="Paramètres"
        >
          ⚙
        </button>
        <button
          class="control-btn expand-btn"
          :class="{ active: isExpanded }"
          @click.stop="emit('toggle-expand')"
          :title="isExpanded ? 'Réduire' : 'Éditer'"
        >
          {{ isExpanded ? "▲" : "▼" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.track-header {
  padding: 8px 12px;
  background: #2d0f20;
  border-left: 4px solid;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 60px;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  z-index: 10;

  &:hover {
    background: #3d1528;
  }
}

.track-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.track-name {
  font-size: 13px;
  font-weight: 500;
  color: #f2efe8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;

  &:hover {
    text-decoration: underline;
  }
}

.track-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  background: #7a0f3e;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.15s ease;

  &:hover {
    background: #9b2458;
    color: #f2efe8;
  }

  &.active {
    color: #f2efe8;
  }

  &.mute-btn.active {
    background: #d7266d;
  }

  &.solo-btn.active {
    background: #fff7ab;
    color: #1a0e15;
  }

  &.expand-btn {
    font-size: 8px;

    &.active {
      background: #ff3fb4;
    }
  }
}
</style>
