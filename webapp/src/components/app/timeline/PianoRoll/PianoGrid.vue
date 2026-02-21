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

// Resize state
const resizingNote = ref<{
  id: string;
  startX: number;
  startWidth: number;
} | null>(null);
const resizePreviewWidth = ref<number | null>(null);

const isResizing = computed(() => resizingNote.value !== null);

const getResizePreviewStyle = (note: MidiNote) => {
  if (resizingNote.value?.id !== note.i || resizePreviewWidth.value === null) {
    return null;
  }
  return {
    left: `${note.x * props.colWidth}px`,
    top: `${note.y * NOTE_ROW_HEIGHT}px`,
    width: `${resizePreviewWidth.value * props.colWidth - 2}px`,
    height: `${NOTE_ROW_HEIGHT - 2}px`,
    backgroundColor: props.color,
  };
};

const handleResizeStart = (event: MouseEvent, note: MidiNote) => {
  event.preventDefault();
  event.stopPropagation();
  resizingNote.value = {
    id: note.i,
    startX: event.clientX,
    startWidth: note.w,
  };
  resizePreviewWidth.value = note.w;
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", handleResizeEnd);
};

const handleResizeMove = (event: MouseEvent) => {
  if (!resizingNote.value) return;

  const deltaX = event.clientX - resizingNote.value.startX;
  const deltaCols = Math.round(deltaX / props.colWidth);
  const newWidth = Math.max(1, resizingNote.value.startWidth + deltaCols);

  const note = props.notes.find((n) => n.i === resizingNote.value?.id);
  if (note) {
    const maxWidth = props.cols - note.x;
    resizePreviewWidth.value = Math.min(newWidth, maxWidth);
  }
};

const handleResizeEnd = () => {
  if (resizingNote.value && resizePreviewWidth.value !== null) {
    const note = props.notes.find((n) => n.i === resizingNote.value?.id);
    if (note && resizePreviewWidth.value !== note.w) {
      emit("update-note", resizingNote.value.id, {
        w: resizePreviewWidth.value,
      });
    }
  }

  resizingNote.value = null;
  resizePreviewWidth.value = null;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
};

const handleGridDblClick = (event: MouseEvent) => {
  if (isResizing.value) return;
  const target = event.target as HTMLElement;
  if (
    target.classList.contains("note-block") ||
    target.classList.contains("resize-handle")
  ) {
    return;
  }
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
  if (isResizing.value) return;
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
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
});
</script>

<template>
  <div
    class="piano-grid"
    :class="{ resizing: isResizing }"
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

    <!-- Notes -->
    <div
      v-for="note in notes"
      :key="note.i"
      class="note-block"
      :class="{
        selected: selectedNotes.has(note.i),
        'black-note': isBlackKey(noteIndexToName(note.y)),
        'is-resizing': resizingNote?.id === note.i,
      }"
      :style="
        getResizePreviewStyle(note) || {
          left: `${note.x * colWidth}px`,
          top: `${note.y * NOTE_ROW_HEIGHT}px`,
          width: `${note.w * colWidth - 2}px`,
          height: `${NOTE_ROW_HEIGHT - 2}px`,
          backgroundColor: color,
        }
      "
      @click="handleNoteClick($event, note)"
      @contextmenu="handleNoteRightClick($event, note)"
    >
      <span class="note-label">{{ noteIndexToName(note.y) }}</span>
      <div class="resize-handle" @mousedown="handleResizeStart($event, note)" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano-grid {
  position: relative;
  cursor: crosshair;

  &.resizing {
    cursor: ew-resize;
  }
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
  z-index: 2;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    opacity: 1;

    .resize-handle {
      opacity: 1;
    }
  }

  &.selected {
    outline: 2px solid #fff7ab;
    box-shadow: 0 0 12px rgba(255, 247, 171, 0.4);
    z-index: 10;

    .resize-handle {
      opacity: 1;
    }
  }

  &.black-note {
    filter: brightness(0.85);
  }

  &.is-resizing {
    opacity: 0.7;
    outline: 2px dashed #fff7ab;
  }
}

.note-label {
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.15s ease;

  &:hover {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 100%
    );
  }
}
</style>
