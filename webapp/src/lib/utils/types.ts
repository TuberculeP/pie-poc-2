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

// Types pour l'arrangement (FL Studio style Playlist)
export interface ArrangementClip {
  id: string; // ID unique du clip
  sequenceId: string; // ID de la séquence référencée
  x: number; // Position de départ (colonne dans l'arrangement)
  y: number; // Piste (0, 1, 2... placement libre)
  color?: string; // Couleur optionnelle du clip
  startOffset?: number; // Début de lecture dans la séquence (trim gauche)
  endOffset?: number; // Fin de lecture dans la séquence (trim droit, depuis la fin)
}

export interface Arrangement {
  id: string;
  name: string;
  clips: ArrangementClip[];
  tempo: number; // Tempo maître
  cols: number; // Longueur totale (ex: 256 colonnes)
  trackCount: number; // Nombre de pistes visibles
  createdAt: Date;
  updatedAt: Date;
}

export interface SequencerProject {
  sequences: Sequence[];
  arrangement: Arrangement; // Vue arrangement avec clips
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
