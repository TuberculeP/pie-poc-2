import { defineStore } from "pinia";
import { ref } from "vue";
import type { MidiNote, AudioClip } from "../lib/utils/types";
import { useTimelineStore } from "./timelineStore";

const MAX_HISTORY_SIZE = 50;

interface HistoryEntry {
  timestamp: number;
  description: string;
  notesBefore: MidiNote[];
  notesAfter: MidiNote[];
  clipsBefore?: AudioClip[];
  clipsAfter?: AudioClip[];
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
    clipsBefore: AudioClip[];
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

  const cloneClips = (clips: AudioClip[] | undefined): AudioClip[] => {
    if (!clips) return [];
    return JSON.parse(JSON.stringify(clips));
  };

  const pushHistory = (
    trackId: string,
    notesBefore: MidiNote[],
    notesAfter: MidiNote[],
    description: string,
    clipsBefore?: AudioClip[],
    clipsAfter?: AudioClip[],
  ): void => {
    const history = getTrackHistory(trackId);

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      description,
      notesBefore: cloneNotes(notesBefore),
      notesAfter: cloneNotes(notesAfter),
      clipsBefore: clipsBefore ? cloneClips(clipsBefore) : undefined,
      clipsAfter: clipsAfter ? cloneClips(clipsAfter) : undefined,
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

    if (entry.clipsBefore !== undefined) {
      timelineStore.setTrackClips(trackId, cloneClips(entry.clipsBefore));
    }

    return true;
  };

  const redo = (trackId: string): boolean => {
    const timelineStore = useTimelineStore();
    const history = getTrackHistory(trackId);

    if (history.redoStack.length === 0) return false;

    const entry = history.redoStack.pop()!;
    history.undoStack.push(entry);

    timelineStore.setTrackNotes(trackId, cloneNotes(entry.notesAfter));

    if (entry.clipsAfter !== undefined) {
      timelineStore.setTrackClips(trackId, cloneClips(entry.clipsAfter));
    }

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

  const recordAddClip = (
    trackId: string,
    clip: Omit<AudioClip, "id">,
  ): string | null => {
    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find((t) => t.id === trackId);
    if (!track) return null;

    const clipsBefore = cloneClips(track.clips);
    const clipId = timelineStore.addClipToTrack(trackId, clip);

    if (clipId) {
      pushHistory(
        trackId,
        track.notes,
        track.notes,
        "Add clip",
        clipsBefore,
        track.clips,
      );
    }

    return clipId;
  };

  const recordRemoveClip = (trackId: string, clipId: string): boolean => {
    const timelineStore = useTimelineStore();
    const track = timelineStore.project.tracks.find((t) => t.id === trackId);
    if (!track) return false;

    const clipsBefore = cloneClips(track.clips);
    const success = timelineStore.removeClipFromTrack(trackId, clipId);

    if (success) {
      pushHistory(
        trackId,
        track.notes,
        track.notes,
        "Remove clip",
        clipsBefore,
        track.clips,
      );
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
      clipsBefore: cloneClips(track.clips),
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
        pendingBatch.clipsBefore,
        track.clips,
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
    recordAddClip,
    recordRemoveClip,
    startBatch,
    endBatch,
    cancelBatch,
    clearTrackHistory,
    clearAllHistory,
  };
});
