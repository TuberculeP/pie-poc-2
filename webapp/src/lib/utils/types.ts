export interface Foo {
  id: number;
  bar: string;
}

export type Note = {
  frequency: number;
  key: string;
  color: string;
  scale: string;
};

// Types pour le séquenceur de notes MIDI
export interface MidiNote {
  i: string; // ID unique de la note
  x: number; // Position horizontale (temps/position dans la séquence)
  y: number; // Position verticale (hauteur de note/pitch)
  w: number; // Largeur (durée de la note)
  h: number; // Hauteur (toujours 1 pour les notes MIDI)
}

export type NoteName = string; // Type pour les noms de notes comme "C4", "A#5", etc.

export interface NoteEvent {
  noteId: string;
  noteName: NoteName;
  position: number;
  duration: number;
  velocity?: number;
}

// Types pour les événements du séquenceur
export type NoteStartHandler = (
  note: MidiNote,
  noteName: NoteName,
  position: number,
) => void;
export type NoteEndHandler = (
  note: MidiNote,
  noteName: NoteName,
  position: number,
) => void;

// Types pour la gestion multi-séquences
export interface Sequence {
  id: string;
  name: string;
  layout: MidiNote[];
  tempo: number;
  cols: number;
  createdAt: Date;
  updatedAt: Date;
  volume: number;
  reverb: number;
}

export interface EQBand {
  id: string;
  frequency: number;
  gain: number;
  type: "lowshelf" | "peaking" | "highshelf";
  label: string;
}

export interface SequencerProject {
  sequences: Sequence[];
  activeSequenceId: string | null;
  projectName: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  volume: number;
  reverb: number;
  eqBands?: EQBand[];
  // Legacy support
  bass?: number;
  mid?: number;
  treble?: number;
}

// Format de sauvegarde compatible avec l'ancien système
export interface LegacySequenceData {
  layout: MidiNote[];
  tempo: number;
  cols: number;
  timestamp: string;
  version: string;
}

// ============================================
// Types pour le système multi-pistes (Timeline GarageBand-style)
// ============================================

export type InstrumentType = "basicSynth" | "elementarySynth" | "smplr";

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

export interface InstrumentConfig {
  type: InstrumentType;
  oscillatorType?: OscillatorType; // Pour basicSynth
  soundfont?: string; // Pour smplr (piano, guitar, marimba, etc.)
  preset?: string; // Pour elementarySynth
  gain?: number; // Volume de l'instrument (0-1)
}

export interface Track {
  id: string;
  name: string;
  instrument: InstrumentConfig;
  color: string;
  volume: number; // 0-100
  reverb: number; // 0-100 (wet/dry mix)
  eqBands: EQBand[]; // EQ 5 bandes par piste
  muted: boolean;
  solo: boolean;
  order: number;
  notes: MidiNote[]; // Notes avec positions absolues sur la timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface Clip {
  id: string;
  trackId: string;
  notes: MidiNote[]; // Notes directement dans le clip
  x: number; // Position sur la timeline (en colonnes)
  w: number; // Largeur du clip (en colonnes)
  color?: string; // Override de la couleur de la piste
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineProject {
  id?: string;
  name: string;
  tracks: Track[];
  cols: number; // Longueur totale de la timeline
  tempo: number; // BPM global
  volume: number; // Volume master (0-100)
  reverb: number; // Reverb master (0-100)
  eqBands?: EQBand[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Couleurs disponibles pour les pistes
export const TRACK_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
] as const;

export type TrackColor = (typeof TRACK_COLORS)[number];

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  following: User[];
  followers: Record<string, any>[];
  posts: Record<string, any>[];
  likedPosts: Record<string, any>[];
  subscription: Record<string, any>;
  sentMessages: Record<string, any>[];
  receivedMessages: Record<string, any>[];
  createdAt: Date;
};

export interface TagObject {
  id: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Post {
  id?: number;
  author: User;
  body: string;
  tags?: (string | TagObject)[];
  comment_of?: number | null;
  comment_of_post_id?: number | null;
  comments?: Post[];
  is_highlight?: boolean;
  highlight_on_tag?: boolean;
  pinned_by_user?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isLikedByMe?: boolean;
  likesCount?: number;
}
export interface CreatePostData {
  body: string;
  tags?: string[];
  comment_of_post_id?: string | null;
  is_highlight?: boolean;
}
