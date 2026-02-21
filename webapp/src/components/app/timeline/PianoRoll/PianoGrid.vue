<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
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
  trackId: string;
}>();

const emit = defineEmits<{
  (e: "add-note", x: number, y: number): void;
  (e: "remove-note", noteId: string): void;
  (
    e: "update-notes",
    updates: Array<{ noteId: string; updates: Partial<MidiNote> }>,
  ): void;
  (e: "delete-notes", noteIds: string[]): void;
  (e: "paste-notes", notes: Array<{ x: number; y: number; w: number }>): void;
  (e: "undo"): void;
  (e: "redo"): void;
}>();

const allNotes = ALL_NOTES;
const selectedNotes = ref<Set<string>>(new Set());

// Clipboard for copy-paste (stores notes relative to anchor point)
const clipboard = ref<Array<{ dx: number; dy: number; w: number }>>([]);

// Mouse position tracking for paste placement
const mouseGridPos = ref<{ col: number; row: number }>({ col: 0, row: 0 });

const gridWidth = computed(() => props.cols * props.colWidth);
const gridHeight = computed(() => TOTAL_NOTES * NOTE_ROW_HEIGHT);

// Resize state (supports group resizing)
const resizingState = ref<{
  startX: number;
  notesInitialWidth: Map<string, { width: number; x: number }>;
} | null>(null);
const resizePreviewDeltas = ref<number | null>(null);

// Drag state (supports group dragging)
const dragState = ref<{
  startMouseX: number;
  startMouseY: number;
  clickedNoteId: string;
  wasSelected: boolean;
  hasMoved: boolean;
  notesInitialPos: Map<string, { x: number; y: number; w: number }>;
} | null>(null);
const dragPreviewDeltas = ref<{ dx: number; dy: number } | null>(null);

// Marquee selection state (Cmd+drag on empty area)
const selectionRect = ref<{
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
} | null>(null);

const isResizing = computed(() => resizingState.value !== null);

const isNoteResizing = (noteId: string) => {
  return resizingState.value?.notesInitialWidth.has(noteId) ?? false;
};
const isDragging = computed(() => dragState.value !== null);
const isSelecting = computed(() => selectionRect.value !== null);

const selectionRectStyle = computed(() => {
  if (!selectionRect.value) return null;
  const { startX, startY, currentX, currentY } = selectionRect.value;
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
});

const isNoteDragging = (noteId: string) => {
  return dragState.value?.notesInitialPos.has(noteId) ?? false;
};

const getNoteStyle = (note: MidiNote) => {
  // Drag preview for notes being dragged
  if (dragState.value && dragPreviewDeltas.value && isNoteDragging(note.i)) {
    const initial = dragState.value.notesInitialPos.get(note.i)!;
    return {
      left: `${(initial.x + dragPreviewDeltas.value.dx) * props.colWidth}px`,
      top: `${(initial.y + dragPreviewDeltas.value.dy) * NOTE_ROW_HEIGHT}px`,
      width: `${note.w * props.colWidth - 2}px`,
      height: `${NOTE_ROW_HEIGHT - 2}px`,
      backgroundColor: props.color,
    };
  }
  // Resize preview for notes being resized
  if (
    resizingState.value &&
    resizePreviewDeltas.value !== null &&
    isNoteResizing(note.i)
  ) {
    const initial = resizingState.value.notesInitialWidth.get(note.i)!;
    const newWidth = initial.width + resizePreviewDeltas.value;
    return {
      left: `${note.x * props.colWidth}px`,
      top: `${note.y * NOTE_ROW_HEIGHT}px`,
      width: `${newWidth * props.colWidth - 2}px`,
      height: `${NOTE_ROW_HEIGHT - 2}px`,
      backgroundColor: props.color,
    };
  }
  // Default
  return {
    left: `${note.x * props.colWidth}px`,
    top: `${note.y * NOTE_ROW_HEIGHT}px`,
    width: `${note.w * props.colWidth - 2}px`,
    height: `${NOTE_ROW_HEIGHT - 2}px`,
    backgroundColor: props.color,
  };
};

const handleResizeStart = (event: MouseEvent, note: MidiNote) => {
  event.preventDefault();
  event.stopPropagation();

  const notesInitialWidth = new Map<string, { width: number; x: number }>();

  // If the note is selected, resize all selected notes
  if (selectedNotes.value.has(note.i)) {
    for (const n of props.notes) {
      if (selectedNotes.value.has(n.i)) {
        notesInitialWidth.set(n.i, { width: n.w, x: n.x });
      }
    }
  } else {
    // Only resize this note
    notesInitialWidth.set(note.i, { width: note.w, x: note.x });
  }

  resizingState.value = {
    startX: event.clientX,
    notesInitialWidth,
  };
  resizePreviewDeltas.value = 0;
  document.addEventListener("mousemove", handleResizeMove);
  document.addEventListener("mouseup", handleResizeEnd);
};

const handleResizeMove = (event: MouseEvent) => {
  if (!resizingState.value) return;

  const deltaX = event.clientX - resizingState.value.startX;
  const rawDeltaCols = Math.round(deltaX / props.colWidth);

  // Calculate constraints based on all resizing notes
  let minDelta = -Infinity;
  let maxDelta = Infinity;

  for (const [, info] of resizingState.value.notesInitialWidth) {
    // Min delta: width must stay >= 1
    minDelta = Math.max(minDelta, 1 - info.width);
    // Max delta: note must not exceed grid bounds
    maxDelta = Math.min(maxDelta, props.cols - info.x - info.width);
  }

  resizePreviewDeltas.value = Math.max(
    minDelta,
    Math.min(maxDelta, rawDeltaCols),
  );
};

const handleResizeEnd = () => {
  if (resizingState.value && resizePreviewDeltas.value !== null) {
    const delta = resizePreviewDeltas.value;
    if (delta !== 0) {
      const updates: Array<{ noteId: string; updates: Partial<MidiNote> }> = [];
      for (const [noteId, info] of resizingState.value.notesInitialWidth) {
        updates.push({ noteId, updates: { w: info.width + delta } });
      }
      emit("update-notes", updates);
    }
    justFinishedInteracting.value = true;
  }
  resizingState.value = null;
  resizePreviewDeltas.value = null;
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
};

// Drag handlers (supports group dragging)
const handleDragStart = (event: MouseEvent, note: MidiNote) => {
  if ((event.target as HTMLElement).classList.contains("resize-handle")) return;
  // Don't start drag on Ctrl/Cmd click (used for multi-select)
  if (event.ctrlKey || event.metaKey) return;
  event.preventDefault();

  const wasSelected = selectedNotes.value.has(note.i);

  // Store initial positions of notes that will be dragged
  // (selection change happens on first move, not on mousedown)
  const notesInitialPos = new Map<
    string,
    { x: number; y: number; w: number }
  >();

  if (wasSelected) {
    // Will drag all selected notes
    for (const n of props.notes) {
      if (selectedNotes.value.has(n.i)) {
        notesInitialPos.set(n.i, { x: n.x, y: n.y, w: n.w });
      }
    }
  } else {
    // Will drag only this note (selection updated on first move)
    notesInitialPos.set(note.i, { x: note.x, y: note.y, w: note.w });
  }

  dragState.value = {
    startMouseX: event.clientX,
    startMouseY: event.clientY,
    clickedNoteId: note.i,
    wasSelected,
    hasMoved: false,
    notesInitialPos,
  };
  dragPreviewDeltas.value = { dx: 0, dy: 0 };

  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
};

const handleDragMove = (event: MouseEvent) => {
  if (!dragState.value) return;

  const deltaX = event.clientX - dragState.value.startMouseX;
  const deltaY = event.clientY - dragState.value.startMouseY;
  const rawDeltaCols = Math.round(deltaX / props.colWidth);
  const rawDeltaRows = Math.round(deltaY / NOTE_ROW_HEIGHT);

  // Track if mouse has actually moved (for distinguishing click vs drag)
  if (!dragState.value.hasMoved && (rawDeltaCols !== 0 || rawDeltaRows !== 0)) {
    dragState.value.hasMoved = true;
  }

  // Calculate constraints based on all dragged notes
  let minDx = -Infinity;
  let maxDx = Infinity;
  let minDy = -Infinity;
  let maxDy = Infinity;

  for (const [, pos] of dragState.value.notesInitialPos) {
    // X constraints: note must stay in [0, cols - width]
    minDx = Math.max(minDx, -pos.x);
    maxDx = Math.min(maxDx, props.cols - pos.w - pos.x);
    // Y constraints: note must stay in [0, TOTAL_NOTES - 1]
    minDy = Math.max(minDy, -pos.y);
    maxDy = Math.min(maxDy, TOTAL_NOTES - 1 - pos.y);
  }

  const constrainedDx = Math.max(minDx, Math.min(maxDx, rawDeltaCols));
  const constrainedDy = Math.max(minDy, Math.min(maxDy, rawDeltaRows));

  dragPreviewDeltas.value = { dx: constrainedDx, dy: constrainedDy };
};

const handleDragEnd = () => {
  if (dragState.value?.hasMoved && dragPreviewDeltas.value) {
    const { dx, dy } = dragPreviewDeltas.value;
    if (dx !== 0 || dy !== 0) {
      const updates: Array<{ noteId: string; updates: Partial<MidiNote> }> = [];
      for (const [noteId, pos] of dragState.value.notesInitialPos) {
        updates.push({ noteId, updates: { x: pos.x + dx, y: pos.y + dy } });
      }
      emit("update-notes", updates);
    }
    justFinishedInteracting.value = true;
  }
  dragState.value = null;
  dragPreviewDeltas.value = null;
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
};

// Marquee selection handlers
const handleSelectionStart = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  selectionRect.value = { startX: x, startY: y, currentX: x, currentY: y };
  document.addEventListener("mousemove", handleSelectionMove);
  document.addEventListener("mouseup", handleSelectionEnd);
};

const handleSelectionMove = (event: MouseEvent) => {
  if (!selectionRect.value) return;
  const grid = document.querySelector(".piano-grid");
  if (!grid) return;
  const rect = grid.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, gridWidth.value));
  const y = Math.max(0, Math.min(event.clientY - rect.top, gridHeight.value));
  selectionRect.value.currentX = x;
  selectionRect.value.currentY = y;
};

const handleSelectionEnd = () => {
  if (selectionRect.value) {
    const { startX, startY, currentX, currentY } = selectionRect.value;
    const left = Math.min(startX, currentX);
    const right = Math.max(startX, currentX);
    const top = Math.min(startY, currentY);
    const bottom = Math.max(startY, currentY);

    // Convert pixel bounds to grid coordinates
    const colLeft = left / props.colWidth;
    const colRight = right / props.colWidth;
    const rowTop = top / NOTE_ROW_HEIGHT;
    const rowBottom = bottom / NOTE_ROW_HEIGHT;

    // Find notes that overlap with the selection rectangle
    for (const note of props.notes) {
      const noteLeft = note.x;
      const noteRight = note.x + note.w;
      const noteTop = note.y;
      const noteBottom = note.y + 1;

      const overlaps =
        noteLeft < colRight &&
        noteRight > colLeft &&
        noteTop < rowBottom &&
        noteBottom > rowTop;

      if (overlaps) {
        selectedNotes.value.add(note.i);
      }
    }
    justFinishedInteracting.value = true;
  }
  selectionRect.value = null;
  document.removeEventListener("mousemove", handleSelectionMove);
  document.removeEventListener("mouseup", handleSelectionEnd);
};

const handleNoteClick = (event: MouseEvent, note: MidiNote) => {
  event.stopPropagation();
  if (event.ctrlKey || event.metaKey) {
    // Ctrl/Cmd+click: toggle in selection
    if (selectedNotes.value.has(note.i)) selectedNotes.value.delete(note.i);
    else selectedNotes.value.add(note.i);
  }
  // Simple click on note: do nothing
};

const justFinishedInteracting = ref(false);

const handleGridMouseMove = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  mouseGridPos.value = {
    col: Math.floor(x / props.colWidth),
    row: Math.floor(y / NOTE_ROW_HEIGHT),
  };
};

const handleGridMouseDown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const isOnNote =
    target.classList.contains("note-block") ||
    target.classList.contains("resize-handle") ||
    target.classList.contains("note-label");

  // Cmd+drag on empty area starts marquee selection
  if ((event.ctrlKey || event.metaKey) && !isOnNote) {
    event.preventDefault();
    handleSelectionStart(event);
  }
};

const handleGridClick = (event: MouseEvent) => {
  // Skip if we just finished a marquee selection
  if (justFinishedInteracting.value) {
    justFinishedInteracting.value = false;
    return;
  }
  const target = event.target as HTMLElement;
  // Click on empty area (not on a note): add a note
  if (
    !target.classList.contains("note-block") &&
    !target.classList.contains("resize-handle") &&
    !target.classList.contains("note-label")
  ) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / props.colWidth);
    const row = Math.floor(y / NOTE_ROW_HEIGHT);

    if (col >= 0 && col < props.cols && row >= 0 && row < TOTAL_NOTES) {
      selectedNotes.value.clear();
      emit("add-note", col, row);
    }
  }
};

const handleGridRightClick = (event: MouseEvent) => {
  event.preventDefault();
  const target = event.target as HTMLElement;
  // Right-click on empty area: clear selection
  if (
    !target.classList.contains("note-block") &&
    !target.classList.contains("resize-handle") &&
    !target.classList.contains("note-label")
  ) {
    selectedNotes.value.clear();
  }
};

const handleNoteRightClick = (event: MouseEvent, note: MidiNote) => {
  event.preventDefault();
  event.stopPropagation();
  emit("remove-note", note.i);
  selectedNotes.value.delete(note.i);
};

const deleteSelectedNotes = () => {
  const noteIds = Array.from(selectedNotes.value);
  emit("delete-notes", noteIds);
  selectedNotes.value.clear();
};

const copySelectedNotes = () => {
  if (selectedNotes.value.size === 0) return;

  // Get selected notes data
  const selected = props.notes.filter((n) => selectedNotes.value.has(n.i));
  if (selected.length === 0) return;

  // Find the anchor: bottom-left note (minimum x, maximum y)
  let anchorX = Infinity;
  let anchorY = -Infinity;
  for (const note of selected) {
    if (note.x < anchorX || (note.x === anchorX && note.y > anchorY)) {
      anchorX = note.x;
      anchorY = note.y;
    }
  }

  // Store notes relative to anchor
  clipboard.value = selected.map((note) => ({
    dx: note.x - anchorX,
    dy: note.y - anchorY,
    w: note.w,
  }));
};

const duplicateSelectedNotes = async () => {
  if (selectedNotes.value.size === 0) return;

  const selected = props.notes.filter((n) => selectedNotes.value.has(n.i));
  if (selected.length === 0) return;

  // Find the rightmost edge of the selection
  let rightmostEdge = 0;
  let minX = Infinity;
  for (const note of selected) {
    rightmostEdge = Math.max(rightmostEdge, note.x + note.w);
    minX = Math.min(minX, note.x);
  }

  // Calculate offset to place duplicates right after the selection
  const offsetX = rightmostEdge - minX;

  // Create duplicated notes
  const notesToPaste: Array<{ x: number; y: number; w: number }> = [];
  for (const note of selected) {
    const x = note.x + offsetX;
    if (x + note.w > props.cols) continue;
    notesToPaste.push({ x, y: note.y, w: note.w });
  }

  if (notesToPaste.length > 0) {
    emit("paste-notes", notesToPaste);

    await nextTick();
    selectedNotes.value.clear();
    for (const pasted of notesToPaste) {
      const match = props.notes.find(
        (n) => n.x === pasted.x && n.y === pasted.y && n.w === pasted.w,
      );
      if (match) {
        selectedNotes.value.add(match.i);
      }
    }
  }
};

const pasteNotes = async () => {
  if (clipboard.value.length === 0) return;

  // Position: anchor note goes immediately to the right of mouse position
  const baseX = mouseGridPos.value.col + 1;
  const baseY = mouseGridPos.value.row;

  // Calculate notes to paste with bounds checking
  const notesToPaste: Array<{ x: number; y: number; w: number }> = [];
  for (const clipNote of clipboard.value) {
    const x = baseX + clipNote.dx;
    const y = baseY + clipNote.dy;

    // Skip notes that would be out of bounds
    if (x < 0 || x + clipNote.w > props.cols) continue;
    if (y < 0 || y >= TOTAL_NOTES) continue;

    notesToPaste.push({ x, y, w: clipNote.w });
  }

  if (notesToPaste.length > 0) {
    emit("paste-notes", notesToPaste);

    // Wait for props.notes to update, then select the pasted notes
    await nextTick();
    selectedNotes.value.clear();
    for (const pasted of notesToPaste) {
      const match = props.notes.find(
        (n) => n.x === pasted.x && n.y === pasted.y && n.w === pasted.w,
      );
      if (match) {
        selectedNotes.value.add(match.i);
      }
    }
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  // Undo: Ctrl/Cmd + Z (without Shift)
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "z" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    emit("undo");
    return;
  }

  // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
  if (
    ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "z") ||
    ((event.ctrlKey || event.metaKey) && event.key === "y")
  ) {
    event.preventDefault();
    emit("redo");
    return;
  }

  if (
    (event.key === "Delete" || event.key === "Backspace") &&
    selectedNotes.value.size > 0
  ) {
    event.preventDefault();
    deleteSelectedNotes();
  } else if (event.key === "Escape") {
    selectedNotes.value.clear();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "c") {
    event.preventDefault();
    copySelectedNotes();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
    event.preventDefault();
    pasteNotes();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "d") {
    event.preventDefault();
    duplicateSelectedNotes();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("mousemove", handleResizeMove);
  document.removeEventListener("mouseup", handleResizeEnd);
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
  document.removeEventListener("mousemove", handleSelectionMove);
  document.removeEventListener("mouseup", handleSelectionEnd);
});
</script>

<template>
  <div
    class="piano-grid"
    :class="{
      resizing: isResizing,
      dragging: isDragging,
      selecting: isSelecting,
    }"
    :style="{ width: `${gridWidth}px`, height: `${gridHeight}px` }"
    @mousemove="handleGridMouseMove"
    @mousedown="handleGridMouseDown"
    @click="handleGridClick"
    @contextmenu="handleGridRightClick"
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
        'is-resizing': isNoteResizing(note.i),
        'is-dragging': isNoteDragging(note.i),
      }"
      :style="getNoteStyle(note)"
      @mousedown="handleDragStart($event, note)"
      @click="handleNoteClick($event, note)"
      @contextmenu="handleNoteRightClick($event, note)"
    >
      <span class="note-label">{{ noteIndexToName(note.y) }}</span>
      <div class="resize-handle" @mousedown="handleResizeStart($event, note)" />
    </div>

    <!-- Marquee selection rectangle -->
    <div
      v-if="selectionRect"
      class="selection-rect"
      :style="selectionRectStyle"
    />
  </div>
</template>

<style scoped lang="scss">
.piano-grid {
  position: relative;
  cursor: crosshair;

  &.resizing {
    cursor: ew-resize;
  }

  &.dragging {
    cursor: grabbing;
  }

  &.selecting {
    cursor: crosshair;
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

  &.is-resizing,
  &.is-dragging {
    opacity: 0.7;
    outline: 2px dashed #fff7ab;
    cursor: grabbing;
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

.selection-rect {
  position: absolute;
  border: 2px dashed #fff7ab;
  background: rgba(255, 247, 171, 0.1);
  pointer-events: none;
  z-index: 20;
}
</style>
