<script setup lang="ts">
import { computed } from "vue";
import type { Track, MidiNote, NoteName } from "../../../lib/utils/types";
import { useTimelineStore } from "../../../stores/timelineStore";
import { useTrackAudioStore } from "../../../stores/trackAudioStore";

const TOTAL_NOTES = 87;
const NOTE_ROW_HEIGHT = 16;

const props = defineProps<{
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

const timelineStore = useTimelineStore();
const trackAudioStore = useTrackAudioStore();

const headerStyle = computed(() => ({
  borderLeftColor: props.track.color,
}));

const gridStyle = computed(() => ({
  width: `${props.cols * props.colWidth}px`,
  height: `${props.rowHeight}px`,
}));

const getNotePreviewTop = (noteY: number): number => {
  const ratio = noteY / TOTAL_NOTES;
  return ratio * props.rowHeight;
};

const getNotePreviewHeight = (): number => {
  return Math.max(2, (props.rowHeight / TOTAL_NOTES) * 4);
};

const handleHeaderClick = () => {
  emit("select-track", props.track);
};

const handleTimelineDblClick = () => {
  emit("toggle-expand", props.track);
};

// Piano Roll - Notes
const noteNamesDescending = [
  "B",
  "A#",
  "A",
  "G#",
  "G",
  "F#",
  "F",
  "E",
  "D#",
  "D",
  "C#",
  "C",
];
const notes = Array.from({ length: TOTAL_NOTES }, (_, i) => {
  const octave = 7 - Math.floor(i / 12);
  const noteIndex = i % 12;
  return `${noteNamesDescending[noteIndex]}${octave}` as NoteName;
});

const whiteKeyMultipliers: Record<string, number> = {
  C: 1.5,
  D: 2,
  E: 1.5,
  F: 1.5,
  G: 2,
  A: 2,
  B: 1.5,
};

const isBlackKey = (noteName: string): boolean => noteName.includes("#");
const isOctaveStart = (noteName: string): boolean =>
  noteName.startsWith("C") && !noteName.includes("#");
const getOctaveNumber = (noteName: string): number => {
  const match = noteName.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 4;
};
const noteIndexToName = (index: number): NoteName =>
  notes[index] || ("C4" as NoteName);

const whiteKeys = computed(() => notes.filter((n) => !isBlackKey(n)));
const blackKeys = computed(() => notes.filter((n) => isBlackKey(n)));

const gridWidth = computed(() => props.cols * props.colWidth);
const gridHeight = computed(() => TOTAL_NOTES * NOTE_ROW_HEIGHT);

const pianoKeysHeight = computed(() => {
  let total = 0;
  for (const note of whiteKeys.value) {
    const noteName = note.replace(/\d+$/, "");
    total += whiteKeyMultipliers[noteName] * NOTE_ROW_HEIGHT;
  }
  return total;
});

const getWhiteKeyStyle = (note: NoteName) => {
  const whiteKeyIndex = whiteKeys.value.indexOf(note);
  const noteName = note.replace(/\d+$/, "");
  let top = 0;
  for (let i = 0; i < whiteKeyIndex; i++) {
    const prevNote = whiteKeys.value[i];
    const prevName = prevNote.replace(/\d+$/, "");
    top += whiteKeyMultipliers[prevName] * NOTE_ROW_HEIGHT;
  }
  return {
    position: "absolute" as const,
    top: `${top}px`,
    height: `${whiteKeyMultipliers[noteName] * NOTE_ROW_HEIGHT}px`,
    width: "100%",
    left: "0",
    zIndex: 1,
  };
};

const getBlackKeyStyle = (note: NoteName) => {
  const noteIndex = notes.indexOf(note);
  return {
    position: "absolute" as const,
    top: `${noteIndex * NOTE_ROW_HEIGHT}px`,
    height: `${NOTE_ROW_HEIGHT}px`,
    width: "55%",
    left: "0",
    zIndex: 2,
  };
};

// Playback active notes
const playbackActiveNotes = computed(() => {
  if (!props.isPlaying) return new Set<NoteName>();
  const activeNotes = new Set<NoteName>();
  const intPosition = Math.floor(props.playbackPosition);
  for (const note of props.track.notes) {
    if (intPosition >= note.x && intPosition < note.x + note.w) {
      activeNotes.add(noteIndexToName(note.y));
    }
  }
  return activeNotes;
});

// Piano preview (glissando)
import { ref, onMounted, onBeforeUnmount } from "vue";
const isMouseDownOnPiano = ref(false);
const activePreviewNotes = ref<Set<NoteName>>(new Set());
const selectedNotes = ref<Set<string>>(new Set());

const allActiveNotes = computed(() => {
  const combined = new Set<NoteName>(activePreviewNotes.value);
  for (const note of playbackActiveNotes.value) {
    combined.add(note);
  }
  return combined;
});

const getPreviewNoteId = (note: NoteName): string => `preview_${note}`;

const playPreviewNote = (note: NoteName): void => {
  if (activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.add(note);
  trackAudioStore.playNoteOnTrack(props.track.id, note, getPreviewNoteId(note));
};

const stopPreviewNote = (note: NoteName): void => {
  if (!activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.delete(note);
  trackAudioStore.stopNoteOnTrack(props.track.id, getPreviewNoteId(note));
};

const stopAllPreviewNotes = (): void => {
  activePreviewNotes.value.forEach((note) => {
    trackAudioStore.stopNoteOnTrack(props.track.id, getPreviewNoteId(note));
  });
  activePreviewNotes.value.clear();
};

const onPianoKeyMouseDown = (note: NoteName): void => {
  isMouseDownOnPiano.value = true;
  playPreviewNote(note);
};

const onPianoKeyMouseUp = (): void => {
  isMouseDownOnPiano.value = false;
  stopAllPreviewNotes();
};

const onPianoKeyMouseEnter = (note: NoteName): void => {
  if (isMouseDownOnPiano.value) playPreviewNote(note);
};

const onPianoKeyMouseLeave = (note: NoteName): void => {
  stopPreviewNote(note);
};

const handleGlobalMouseUp = (): void => {
  if (isMouseDownOnPiano.value) {
    isMouseDownOnPiano.value = false;
    stopAllPreviewNotes();
  }
};

// Grid interactions
const handleGridDblClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains("note-block")) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / props.colWidth);
  const row = Math.floor(y / NOTE_ROW_HEIGHT);

  if (col >= 0 && col < props.cols && row >= 0 && row < TOTAL_NOTES) {
    const noteId = timelineStore.addNoteToTrack(props.track.id, {
      x: col,
      y: row,
      w: 1,
      h: 1,
    });
    if (noteId) {
      const noteName = noteIndexToName(row);
      trackAudioStore.playNoteOnTrack(props.track.id, noteName, noteId);
      setTimeout(
        () => trackAudioStore.stopNoteOnTrack(props.track.id, noteId),
        200,
      );
    }
  }
};

const handleNoteClick = (event: MouseEvent, note: MidiNote) => {
  event.stopPropagation();
  if (event.ctrlKey || event.metaKey) {
    if (selectedNotes.value.has(note.i)) selectedNotes.value.delete(note.i);
    else selectedNotes.value.add(note.i);
  } else {
    selectedNotes.value.clear();
    selectedNotes.value.add(note.i);
  }
};

const handleNoteRightClick = (event: MouseEvent, note: MidiNote) => {
  event.preventDefault();
  event.stopPropagation();
  timelineStore.removeNoteFromTrack(props.track.id, note.i);
  selectedNotes.value.delete(note.i);
};

const deleteSelectedNotes = () => {
  for (const noteId of selectedNotes.value) {
    timelineStore.removeNoteFromTrack(props.track.id, noteId);
  }
  selectedNotes.value.clear();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (
    (event.key === "Delete" || event.key === "Backspace") &&
    selectedNotes.value.size > 0
  ) {
    event.preventDefault();
    deleteSelectedNotes();
  } else if (event.key === "Escape") {
    selectedNotes.value.clear();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  document.addEventListener("mouseup", handleGlobalMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("mouseup", handleGlobalMouseUp);
  stopAllPreviewNotes();
});
</script>

<template>
  <div
    class="track-row"
    :class="{ active: isActive, muted: track.muted, expanded: isExpanded }"
  >
    <!-- Row principale : header + timeline preview -->
    <div class="track-header" :style="headerStyle" @click="handleHeaderClick">
      <div class="track-info">
        <span class="track-name" @dblclick.stop="emit('rename-track', track)">{{
          track.name
        }}</span>
        <div class="track-controls">
          <button
            class="control-btn mute-btn"
            :class="{ active: track.muted }"
            @click.stop="emit('toggle-mute', track)"
            title="Mute"
          >
            M
          </button>
          <button
            class="control-btn solo-btn"
            :class="{ active: track.solo }"
            @click.stop="emit('toggle-solo', track)"
            title="Solo"
          >
            S
          </button>
          <button
            class="control-btn settings-btn"
            @click.stop="emit('open-settings', track)"
            title="Paramètres"
          >
            ⚙
          </button>
          <button
            class="control-btn expand-btn"
            :class="{ active: isExpanded }"
            @click.stop="emit('toggle-expand', track)"
            :title="isExpanded ? 'Réduire' : 'Éditer'"
          >
            {{ isExpanded ? "▲" : "▼" }}
          </button>
        </div>
      </div>
    </div>

    <div
      class="track-timeline"
      :style="gridStyle"
      @dblclick="handleTimelineDblClick"
    >
      <div class="grid-lines">
        <div
          v-for="i in Math.ceil(cols / 4)"
          :key="i"
          class="measure-line"
          :style="{ left: `${(i - 1) * 4 * colWidth}px` }"
        />
      </div>
      <div class="notes-preview">
        <div
          v-for="note in track.notes"
          :key="note.i"
          class="note-preview"
          :style="{
            left: `${note.x * colWidth}px`,
            top: `${getNotePreviewTop(note.y)}px`,
            width: `${Math.max(note.w * colWidth - 1, 2)}px`,
            height: `${getNotePreviewHeight()}px`,
            backgroundColor: track.color,
          }"
        />
      </div>
    </div>

    <!-- Piano Roll : wrapper scrollable contenant keys (sticky) + grille -->
    <template v-if="isExpanded">
      <div class="piano-roll-wrapper">
        <!-- Piano Keys (sticky left dans le wrapper) -->
        <div class="piano-keys">
          <div
            class="piano-keys-inner"
            :style="{
              height: `${pianoKeysHeight}px`,
              minHeight: `${gridHeight}px`,
            }"
          >
            <div
              v-for="note in whiteKeys"
              :key="`white-${note}`"
              class="piano-key white-key"
              :class="{
                'octave-start': isOctaveStart(note),
                'preview-active': allActiveNotes.has(note),
              }"
              :style="getWhiteKeyStyle(note)"
              @mousedown.prevent="onPianoKeyMouseDown(note)"
              @mouseup="onPianoKeyMouseUp()"
              @mouseenter="onPianoKeyMouseEnter(note)"
              @mouseleave="onPianoKeyMouseLeave(note)"
            >
              <span class="note-name">{{ note }}</span>
              <span v-if="isOctaveStart(note)" class="octave-number">{{
                getOctaveNumber(note)
              }}</span>
            </div>
            <div
              v-for="note in blackKeys"
              :key="`black-${note}`"
              class="piano-key black-key"
              :class="{ 'preview-active': allActiveNotes.has(note) }"
              :style="getBlackKeyStyle(note)"
              @mousedown.prevent="onPianoKeyMouseDown(note)"
              @mouseup="onPianoKeyMouseUp()"
              @mouseenter="onPianoKeyMouseEnter(note)"
              @mouseleave="onPianoKeyMouseLeave(note)"
            >
              <span class="note-name">{{ note }}</span>
            </div>
          </div>
        </div>

        <!-- Grille -->
        <div
          class="piano-roll-grid"
          :style="{ width: `${gridWidth}px`, height: `${gridHeight}px` }"
          @dblclick="handleGridDblClick"
        >
          <div class="measure-lines">
            <div
              v-for="i in Math.ceil(cols / 4)"
              :key="`measure-${i}`"
              class="measure-line"
              :style="{ left: `${(i - 1) * 4 * colWidth}px` }"
            />
          </div>
          <div class="grid-background">
            <div
              v-for="(noteName, rowIndex) in notes"
              :key="`row-${rowIndex}`"
              class="grid-row"
              :class="{
                'black-key-row': isBlackKey(noteName),
                'octave-start-row': isOctaveStart(noteName),
                'preview-highlight': allActiveNotes.has(noteName),
              }"
              :style="{ height: `${NOTE_ROW_HEIGHT}px` }"
            >
              <div
                v-for="col in cols"
                :key="`cell-${rowIndex}-${col}`"
                class="grid-cell"
                :style="{ width: `${colWidth}px` }"
              />
            </div>
          </div>
          <div
            v-for="note in track.notes"
            :key="note.i"
            class="note-block"
            :class="{
              selected: selectedNotes.has(note.i),
              'black-note': isBlackKey(noteIndexToName(note.y)),
            }"
            :style="{
              left: `${note.x * colWidth}px`,
              top: `${note.y * NOTE_ROW_HEIGHT}px`,
              width: `${note.w * colWidth - 2}px`,
              height: `${NOTE_ROW_HEIGHT - 2}px`,
              backgroundColor: track.color,
            }"
            @click="handleNoteClick($event, note)"
            @contextmenu="handleNoteRightClick($event, note)"
          >
            <span class="note-label">{{ noteIndexToName(note.y) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.track-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-template-rows: auto auto;
  border-bottom: 1px solid rgba(122, 15, 62, 0.5);

  &.active .track-header {
    background: #3d1528;
  }
  &.muted {
    opacity: 0.5;
  }
  &.expanded .track-header {
    background: #3d1528;
  }
}

.track-header {
  grid-column: 1;
  grid-row: 1;
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

.track-timeline {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  background: #1a0e15;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background: #1f1119;
  }
}

.piano-roll-wrapper {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  height: 400px;
  overflow-y: auto;
  background: #1a0e15;
  border-top: 1px solid rgba(122, 15, 62, 0.5);

  scrollbar-width: thin;
  scrollbar-color: rgba(122, 15, 62, 0.5) transparent;
}

.piano-keys {
  width: 180px;
  min-width: 180px;
  flex-shrink: 0;
  background: #2a2a2a;
  border-right: 2px solid #333;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  z-index: 5;
}

.piano-keys-inner {
  position: relative;
  width: 100%;
}

.piano-key {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 4px;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  box-sizing: border-box;
}

.piano-key.white-key {
  background: linear-gradient(to left, #e8e8e8 0%, #f5f5f5 50%, #e0e0e0 100%);
  color: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid #bbb;
  border-radius: 0 0 3px 3px;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(to left, #f0f0f0 0%, #fff 50%, #e8e8e8 100%);
  }
  &.octave-start {
    border-bottom: 2px solid #222;
  }
  &.preview-active {
    background: #d7266d !important;
    color: white !important;
  }
}

.piano-key.black-key {
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 60%, #0a0a0a 100%);
  color: rgba(255, 255, 255, 0.25);
  border-radius: 0 0 2px 2px;
  box-shadow:
    inset 0 -3px 5px rgba(0, 0, 0, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  justify-content: center;
  padding-right: 0;

  &:hover {
    background: linear-gradient(
      to bottom,
      #3a3a3a 0%,
      #2a2a2a 60%,
      #1a1a1a 100%
    );
  }
  &.preview-active {
    background: #9b2458 !important;
    color: white !important;
  }
}

.note-name {
  font-size: 10px;
}
.black-key .note-name {
  font-size: 8px;
  text-align: center;
}
.octave-number {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.3);
  font-weight: bold;
  margin-left: 3px;
}

.piano-roll-grid {
  position: relative;
  cursor: crosshair;
}

.grid-background {
  position: absolute;
  inset: 0;
}

.grid-row {
  display: flex;
  &.black-key-row {
    background: rgba(0, 0, 0, 0.15);
  }
  &.octave-start-row {
    border-bottom: 2px solid rgba(0, 0, 0, 0.3);
  }
  &.preview-highlight {
    background: rgba(215, 38, 109, 0.15) !important;
  }
}

.grid-cell {
  border-right: 1px solid rgba(122, 15, 62, 0.2);
  border-bottom: 1px solid rgba(122, 15, 62, 0.15);
  box-sizing: border-box;
}

.measure-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.note-block {
  position: absolute;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 3px;
  font-size: 8px;
  color: rgba(0, 0, 0, 0.8);
  user-select: none;
  opacity: 0.9;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    opacity: 1;
  }
  &.selected {
    outline: 2px solid #fff7ab;
    box-shadow: 0 0 12px rgba(255, 247, 171, 0.4);
    z-index: 10;
  }
  &.black-note {
    filter: brightness(0.85);
  }
}

.note-label {
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
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
.notes-preview {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.note-preview {
  position: absolute;
  border-radius: 1px;
  opacity: 0.8;
  pointer-events: none;
}
</style>
