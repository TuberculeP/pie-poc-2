import { defineStore } from "pinia";
import { ref } from "vue";
import type { MidiNote } from "../lib/utils/types";
import { useTimelineStore } from "./timelineStore";

const MAX_HISTORY_SIZE = 50;

interface HistoryEntry {
  timestamp: number;
  description: string;
  notesBefore: MidiNote[];
  notesAfter: MidiNote[];
}

interface TrackHistory {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
}

export const useTrackHistoryStore = defineStore("trackHistory", () => {
  const histories = ref<Map<string, TrackHistory>>(new Map());

  let pendingBatch: {
    trackId: string;
    notesBefore: MidiNote[];
    description: string;
  } | null = null;

  const getTrackHistory = (trackId: string): TrackHistory => {
    if (!histories.value.has(trackId)) {
      histories.value.set(trackId, { undoStack: [], redoStack: [] });
    }
    return histories.value.get(trackId)!;
  };

  const cloneNotes = (notes: MidiNote[]): MidiNote[] => {
    return JSON.parse(JSON.stringify(notes));
  };

  const pushHistory = (
    trackId: string,
    notesBefore: MidiNote[],
    notesAfter: MidiNote[],
    description: string,
  ): void => {
    const history = getTrackHistory(trackId);

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      description,
      notesBefore: cloneNotes(notesBefore),
      notesAfter: cloneNotes(notesAfter),
    };

    history.undoStack.push(entry);

    if (history.undoStack.length > MAX_HISTORY_SIZE) {
      history.undoStack.shift();
    }

    history.redoStack = [];
  };

  const undo = (trackId: string): boolean => {
    const timelineStore = useTimelineStore();
    const history = getTrackHistory(trackId);

    if (history.undoStack.length === 0) return false;

    const entry = history.undoStack.pop()!;
    history.redoStack.push(entry);

    timelineStore.setTrackNotes(trackId, cloneNotes(entry.notesBefore));

    return true;
  };

  const redo = (trackId: string): boolean => {
    const timelineStore = useTimelineStore();
    const history = getTrackHistory(trackId);

    if (history.redoStack.length === 0) return false;

    const entry = history.redoStack.pop()!;
    history.undoStack.push(entry);

    timelineStore.setTrackNotes(trackId, cloneNotes(entry.notesAfter));

    return true;
  };

  const canUndo = (trackId: string): boolean => {
    return getTrackHistory(trackId).undoStack.length > 0;
  };

  const canRedo = (trackId: string): boolean => {
    return getTrackHistory(trackId).redoStack.length > 0;
  };

  const recordAddNote = (
    trackId: string,
    note: Omit<MidiNote, "i">,
  ): string | null => {
    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find((t) => t.id === trackId);
    if (!track) return null;

    const notesBefore = cloneNotes(track.notes);
    const noteId = timelineStore.addNoteToTrack(trackId, note);

    if (noteId) {
      pushHistory(trackId, notesBefore, track.notes, "Add note");
    }

    return noteId;
  };

  const recordRemoveNote = (trackId: string, noteId: string): boolean => {
    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find((t) => t.id === trackId);
    if (!track) return false;

    const notesBefore = cloneNotes(track.notes);
    const success = timelineStore.removeNoteFromTrack(trackId, noteId);

    if (success) {
      pushHistory(trackId, notesBefore, track.notes, "Remove note");
    }

    return success;
  };

  const startBatch = (trackId: string, description: string): void => {
    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find((t) => t.id === trackId);
    if (!track) return;

    pendingBatch = {
      trackId,
      notesBefore: cloneNotes(track.notes),
      description,
    };
  };

  const endBatch = (): void => {
    if (!pendingBatch) return;

    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find(
      (t) => t.id === pendingBatch!.trackId,
    );

    if (track) {
      pushHistory(
        pendingBatch.trackId,
        pendingBatch.notesBefore,
        track.notes,
        pendingBatch.description,
      );
    }

    pendingBatch = null;
  };

  const cancelBatch = (): void => {
    pendingBatch = null;
  };

  const clearTrackHistory = (trackId: string): void => {
    histories.value.delete(trackId);
  };

  const clearAllHistory = (): void => {
    histories.value.clear();
  };

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    recordAddNote,
    recordRemoveNote,
    startBatch,
    endBatch,
    cancelBatch,
    clearTrackHistory,
    clearAllHistory,
  };
});
