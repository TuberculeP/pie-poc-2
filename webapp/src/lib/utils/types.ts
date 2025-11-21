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
}

export interface SequencerProject {
  sequences: Sequence[];
  activeSequenceId: string | null;
  projectName: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Format de sauvegarde compatible avec l'ancien système
export interface LegacySequenceData {
  layout: MidiNote[];
  tempo: number;
  cols: number;
  timestamp: string;
  version: string;
}

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

export interface Post {
  id?: number;
  author: User;
  body: string;
  tags?: string[];
  comment_of?: number | null;
  comments?: Post[];
  is_highlight?: boolean;
  highlight_on_tag?: boolean;
  pinned_by_user?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
