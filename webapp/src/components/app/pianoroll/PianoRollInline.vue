<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useTimelineStore } from "../../../stores/timelineStore";
import { useTrackAudioStore } from "../../../stores/trackAudioStore";
import type { MidiNote, NoteName } from "../../../lib/utils/types";

const props = defineProps<{
  trackId: string;
  trackColor: string;
  cols: number;
  colWidth: number;
  playbackPosition: number;
  isPlaying: boolean;
}>();

const timelineStore = useTimelineStore();
const trackAudioStore = useTrackAudioStore();

const NOTE_ROW_HEIGHT = 16;
const TOTAL_NOTES = 87;

// Multiplicateurs de hauteur pour les touches blanches (style piano réaliste)
const whiteKeyMultipliers: Record<string, number> = {
  C: 1.5,
  D: 2,
  E: 1.5,
  F: 1.5,
  G: 2,
  A: 2,
  B: 1.5,
};

// Génération des noms de notes (B7 en haut à C0 en bas)
// Ordre descendant : B est le plus aigu dans l'octave, C le plus grave
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
  // i=0 → B7, i=11 → C7, i=12 → B6, etc.
  const octave = 7 - Math.floor(i / 12);
  const noteIndex = i % 12;
  return `${noteNamesDescending[noteIndex]}${octave}` as NoteName;
});

// Track et notes
const track = computed(() =>
  timelineStore.tracks.find((t) => t.id === props.trackId),
);
const trackNotes = computed(() => track.value?.notes || []);

// Dimensions
const gridWidth = computed(() => props.cols * props.colWidth);
const gridHeight = computed(() => TOTAL_NOTES * NOTE_ROW_HEIGHT);

// Sélection
const selectedNotes = ref<Set<string>>(new Set());

// Refs pour le scroll
const gridContainerRef = ref<HTMLElement | null>(null);
const pianoKeysRef = ref<HTMLElement | null>(null);

// État glissando preview
const isMouseDownOnPiano = ref<boolean>(false);
const activePreviewNotes = ref<Set<NoteName>>(new Set());

// Notes en cours de lecture pendant le playback
const playbackActiveNotes = computed(() => {
  if (!props.isPlaying) return new Set<NoteName>();

  const activeNotes = new Set<NoteName>();
  const intPosition = Math.floor(props.playbackPosition);

  for (const note of trackNotes.value) {
    const noteStart = note.x;
    const noteEnd = note.x + note.w;

    if (intPosition >= noteStart && intPosition < noteEnd) {
      activeNotes.add(noteIndexToName(note.y));
    }
  }

  return activeNotes;
});

// Combine preview manuelle + playback pour le highlight visuel
const allActiveNotes = computed(() => {
  const combined = new Set<NoteName>(activePreviewNotes.value);
  for (const note of playbackActiveNotes.value) {
    combined.add(note);
  }
  return combined;
});

// Utils
const isBlackKey = (noteName: string): boolean => {
  return noteName.includes("#");
};

const isOctaveStart = (noteName: string): boolean => {
  return noteName.startsWith("C") && !noteName.includes("#");
};

const getOctaveNumber = (noteName: string): number => {
  const match = noteName.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 4;
};

const noteIndexToName = (index: number): NoteName => {
  return notes[index] || ("C4" as NoteName);
};

// Listes séparées des touches blanches et noires
const whiteKeys = computed(() => notes.filter((n) => !isBlackKey(n)));
const blackKeys = computed(() => notes.filter((n) => isBlackKey(n)));

// Style pour les touches blanches (empilées avec multiplicateurs)
const getWhiteKeyStyle = (note: NoteName) => {
  const whiteKeyIndex = whiteKeys.value.indexOf(note);
  const noteName = note.replace(/\d+$/, "");

  // Calculer la position top en accumulant les hauteurs des touches blanches précédentes
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

// Style pour les touches noires (alignées sur la grille)
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

// Hauteur totale du piano (pour position: relative container)
const pianoKeysHeight = computed(() => {
  let total = 0;
  for (const note of whiteKeys.value) {
    const noteName = note.replace(/\d+$/, "");
    total += whiteKeyMultipliers[noteName] * NOTE_ROW_HEIGHT;
  }
  return total;
});

// Sync scroll vertical entre piano keys et grille
const handleGridScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  // Sync scroll vertical avec les touches piano
  if (pianoKeysRef.value) {
    pianoKeysRef.value.scrollTop = target.scrollTop;
  }
};

const handlePianoKeysScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  // Sync scroll vertical avec la grille
  if (gridContainerRef.value) {
    gridContainerRef.value.scrollTop = target.scrollTop;
  }
};

// Glissando preview functions - utiliser un ID constant par note pour pouvoir l'arrêter
const getPreviewNoteId = (note: NoteName): string => `preview_${note}`;

const playPreviewNote = (note: NoteName): void => {
  if (activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.add(note);
  trackAudioStore.playNoteOnTrack(props.trackId, note, getPreviewNoteId(note));
};

const stopPreviewNote = (note: NoteName): void => {
  if (!activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.delete(note);
  trackAudioStore.stopNoteOnTrack(props.trackId, getPreviewNoteId(note));
};

const stopAllPreviewNotes = (): void => {
  activePreviewNotes.value.forEach((note) => {
    trackAudioStore.stopNoteOnTrack(props.trackId, getPreviewNoteId(note));
  });
  activePreviewNotes.value.clear();
};

// Handlers glissando
const onPianoKeyMouseDown = (note: NoteName): void => {
  isMouseDownOnPiano.value = true;
  playPreviewNote(note);
};

const onPianoKeyMouseUp = (_note: NoteName): void => {
  isMouseDownOnPiano.value = false;
  stopAllPreviewNotes();
};

const onPianoKeyMouseEnter = (note: NoteName): void => {
  if (isMouseDownOnPiano.value) {
    playPreviewNote(note);
  }
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

// Ajout de note au double-clic
const handleGridDblClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains("note-block")) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.floor(x / props.colWidth);
  const row = Math.floor(y / NOTE_ROW_HEIGHT);

  if (col >= 0 && col < props.cols && row >= 0 && row < TOTAL_NOTES) {
    const noteId = timelineStore.addNoteToTrack(props.trackId, {
      x: col,
      y: row,
      w: 1,
      h: 1,
    });

    if (noteId) {
      const noteName = noteIndexToName(row);
      trackAudioStore.playNoteOnTrack(props.trackId, noteName, noteId);
      setTimeout(() => {
        trackAudioStore.stopNoteOnTrack(props.trackId, noteId);
      }, 200);
    }
  }
};

// Clic sur note pour sélection
const handleNoteClick = (event: MouseEvent, note: MidiNote) => {
  event.stopPropagation();

  if (event.ctrlKey || event.metaKey) {
    if (selectedNotes.value.has(note.i)) {
      selectedNotes.value.delete(note.i);
    } else {
      selectedNotes.value.add(note.i);
    }
  } else {
    selectedNotes.value.clear();
    selectedNotes.value.add(note.i);
  }
};

// Clic droit pour supprimer
const handleNoteRightClick = (event: MouseEvent, note: MidiNote) => {
  event.preventDefault();
  event.stopPropagation();
  timelineStore.removeNoteFromTrack(props.trackId, note.i);
  selectedNotes.value.delete(note.i);
};

// Supprimer notes sélectionnées
const deleteSelectedNotes = () => {
  for (const noteId of selectedNotes.value) {
    timelineStore.removeNoteFromTrack(props.trackId, noteId);
  }
  selectedNotes.value.clear();
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedNotes.value.size > 0) {
      event.preventDefault();
      deleteSelectedNotes();
    }
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
  <div class="piano-roll-inline">
    <!-- Touches piano (sticky left) -->
    <div ref="pianoKeysRef" class="piano-keys" @scroll="handlePianoKeysScroll">
      <div
        class="piano-keys-inner"
        :style="{
          height: `${pianoKeysHeight}px`,
          minHeight: `${gridHeight}px`,
        }"
      >
        <!-- Touches blanches (z-index bas, pleine largeur) -->
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
          @mouseup="onPianoKeyMouseUp(note)"
          @mouseenter="onPianoKeyMouseEnter(note)"
          @mouseleave="onPianoKeyMouseLeave(note)"
        >
          <span class="note-name">{{ note }}</span>
          <span v-if="isOctaveStart(note)" class="octave-number">{{
            getOctaveNumber(note)
          }}</span>
        </div>

        <!-- Touches noires (z-index haut, alignées sur la grille) -->
        <div
          v-for="note in blackKeys"
          :key="`black-${note}`"
          class="piano-key black-key"
          :class="{
            'preview-active': allActiveNotes.has(note),
          }"
          :style="getBlackKeyStyle(note)"
          @mousedown.prevent="onPianoKeyMouseDown(note)"
          @mouseup="onPianoKeyMouseUp(note)"
          @mouseenter="onPianoKeyMouseEnter(note)"
          @mouseleave="onPianoKeyMouseLeave(note)"
        >
          <span class="note-name">{{ note }}</span>
        </div>
      </div>
    </div>

    <!-- Grille scrollable -->
    <div
      ref="gridContainerRef"
      class="grid-container"
      @scroll="handleGridScroll"
    >
      <div
        class="grid-area"
        :style="{ width: `${gridWidth}px`, height: `${gridHeight}px` }"
        @dblclick="handleGridDblClick"
      >
        <!-- Fond de grille -->
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
              :class="{ 'beat-marker': (col - 1) % 4 === 0 }"
              :style="{ width: `${colWidth}px` }"
            />
          </div>
        </div>

        <!-- Notes -->
        <div
          v-for="note in trackNotes"
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
            backgroundColor: trackColor,
          }"
          @click="handleNoteClick($event, note)"
          @contextmenu="handleNoteRightClick($event, note)"
        >
          <span class="note-label">{{ noteIndexToName(note.y) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano-roll-inline {
  display: flex;
  height: 400px;
  background: #1a0e15;
  border-top: 1px solid rgba(122, 15, 62, 0.5);
  // La largeur totale = touches piano + grille
  // La grille fait cols * colWidth, les touches font 180px
}

.piano-keys {
  width: 180px;
  min-width: 180px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #2a2a2a;
  border-right: 2px solid #333;
  position: sticky;
  left: 0;
  z-index: 10;

  // Masquer scrollbar mais garder fonctionnalité
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
  transition: background-color 0.1s;
  box-sizing: border-box;
}

// Touches blanches
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

// Touches noires
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
  text-align: right;
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

.grid-container {
  overflow-x: visible;
  overflow-y: auto;
  position: relative;

  // Masquer scrollbar vertical
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.grid-area {
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

  &.beat-marker {
    border-right-color: rgba(122, 15, 62, 0.4);
  }
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
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
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
</style>
