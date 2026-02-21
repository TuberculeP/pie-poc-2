<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { MidiNote, NoteName } from "../../../../lib/utils/types";
import {
  TOTAL_NOTES,
  NOTE_ROW_HEIGHT,
  ALL_NOTES,
  isBlackKey,
  isOctaveStart,
  noteIndexToName,
} from "../../../../lib/audio/pianoRollConstants";

const props = defineProps<{
  notes: MidiNote[];
  cols: number;
  colWidth: number;
  color: string;
  activeNotes: Set<NoteName>;
}>();

const emit = defineEmits<{
  (e: "add-note", x: number, y: number): void;
  (e: "remove-note", noteId: string): void;
  (e: "update-note", noteId: string, updates: Partial<MidiNote>): void;
}>();

const allNotes = ALL_NOTES;
const selectedNotes = ref<Set<string>>(new Set());

const gridWidth = computed(() => props.cols * props.colWidth);
const gridHeight = computed(() => TOTAL_NOTES * NOTE_ROW_HEIGHT);

const handleGridDblClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains("note-block")) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / props.colWidth);
  const row = Math.floor(y / NOTE_ROW_HEIGHT);

  if (col >= 0 && col < props.cols && row >= 0 && row < TOTAL_NOTES) {
    emit("add-note", col, row);
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
  emit("remove-note", note.i);
  selectedNotes.value.delete(note.i);
};

const deleteSelectedNotes = () => {
  for (const noteId of selectedNotes.value) {
    emit("remove-note", noteId);
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
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    class="piano-grid"
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
        v-for="(noteName, rowIndex) in allNotes"
        :key="`row-${rowIndex}`"
        class="grid-row"
        :class="{
          'black-key-row': isBlackKey(noteName),
          'octave-start-row': isOctaveStart(noteName),
          'preview-highlight': activeNotes.has(noteName),
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
      v-for="note in notes"
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
        backgroundColor: color,
      }"
      @click="handleNoteClick($event, note)"
      @contextmenu="handleNoteRightClick($event, note)"
    >
      <span class="note-label">{{ noteIndexToName(note.y) }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano-grid {
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

.measure-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(122, 15, 62, 0.5);
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
</style>
