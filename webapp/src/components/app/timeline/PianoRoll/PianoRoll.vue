<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import type { Track, MidiNote, NoteName } from "../../../../lib/utils/types";
import { useTimelineStore } from "../../../../stores/timelineStore";
import { useTrackAudioStore } from "../../../../stores/trackAudioStore";
import {
  TOTAL_NOTES,
  NOTE_ROW_HEIGHT,
  noteIndexToName,
} from "../../../../lib/audio/pianoRollConstants";
import PianoKeys from "./PianoKeys.vue";
import PianoGrid from "./PianoGrid.vue";

const props = defineProps<{
  track: Track;
  cols: number;
  colWidth: number;
  playbackPosition: number;
  isPlaying: boolean;
}>();

const timelineStore = useTimelineStore();
const trackAudioStore = useTrackAudioStore();

const gridHeight = computed(() => TOTAL_NOTES * NOTE_ROW_HEIGHT);

const activePreviewNotes = ref<Set<NoteName>>(new Set());

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

const allActiveNotes = computed(() => {
  const combined = new Set<NoteName>(activePreviewNotes.value);
  for (const note of playbackActiveNotes.value) {
    combined.add(note);
  }
  return combined;
});

const getPreviewNoteId = (note: NoteName): string => `preview_${note}`;

const handleNoteStart = (note: NoteName): void => {
  if (activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.add(note);
  trackAudioStore.playNoteOnTrack(props.track.id, note, getPreviewNoteId(note));
};

const handleNoteStop = (note: NoteName): void => {
  if (!activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.delete(note);
  trackAudioStore.stopNoteOnTrack(props.track.id, getPreviewNoteId(note));
};

const handleAllNotesStop = (): void => {
  activePreviewNotes.value.forEach((note) => {
    trackAudioStore.stopNoteOnTrack(props.track.id, getPreviewNoteId(note));
  });
  activePreviewNotes.value.clear();
};

const handleAddNote = (x: number, y: number): void => {
  const noteId = timelineStore.addNoteToTrack(props.track.id, {
    x,
    y,
    w: 1,
    h: 1,
  });
  if (noteId) {
    const noteName = noteIndexToName(y);
    trackAudioStore.playNoteOnTrack(props.track.id, noteName, noteId);
    setTimeout(
      () => trackAudioStore.stopNoteOnTrack(props.track.id, noteId),
      200,
    );
  }
};

const handleRemoveNote = (noteId: string): void => {
  timelineStore.removeNoteFromTrack(props.track.id, noteId);
};

const handleUpdateNote = (noteId: string, updates: Partial<MidiNote>): void => {
  timelineStore.updateNoteInTrack(props.track.id, noteId, updates);
};

const handlePasteNotes = (
  notes: Array<{ x: number; y: number; w: number }>,
): void => {
  for (const note of notes) {
    timelineStore.addNoteToTrack(props.track.id, {
      x: note.x,
      y: note.y,
      w: note.w,
      h: 1,
    });
  }
};

onBeforeUnmount(() => {
  handleAllNotesStop();
});
</script>

<template>
  <div class="piano-roll-wrapper">
    <PianoKeys
      :active-notes="allActiveNotes"
      :grid-height="gridHeight"
      @note-start="handleNoteStart"
      @note-stop="handleNoteStop"
      @all-notes-stop="handleAllNotesStop"
    />
    <PianoGrid
      :notes="track.notes"
      :cols="cols"
      :col-width="colWidth"
      :color="track.color"
      :active-notes="allActiveNotes"
      @add-note="handleAddNote"
      @remove-note="handleRemoveNote"
      @update-note="handleUpdateNote"
      @paste-notes="handlePasteNotes"
    />
  </div>
</template>

<style scoped lang="scss">
.piano-roll-wrapper {
  display: flex;
  height: 400px;
  overflow: auto;
  background: #1a0e15;
  border-top: 1px solid rgba(122, 15, 62, 0.5);
  scrollbar-width: thin;
  scrollbar-color: rgba(122, 15, 62, 0.5) transparent;
}
</style>
