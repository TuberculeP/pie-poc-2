# DAW Timeline V2 - Documentation Technique

> **V2 - Architecture simplifiée**
> Cette implémentation abandonne le concept de clips pour une approche plus intuitive : une piste = une séquence de notes. Le piano roll s'affiche inline sous la piste au lieu d'être un modal.

## Vue d'ensemble

Architecture multi-pistes style GarageBand simplifiée pour les débutants :

- **Une piste = une séquence de notes** (plus de clips intermédiaires)
- **Piano roll inline** : s'expand sous la piste au double-clic
- **Preview des notes** visible directement sur la timeline (style Ableton/FL Studio)

## Architecture V2

### Stores

| Store             | Fichier                     | Rôle                                                         |
| ----------------- | --------------------------- | ------------------------------------------------------------ |
| `timelineStore`   | `stores/timelineStore.ts`   | Gestion des pistes et notes, état d'expansion                |
| `trackAudioStore` | `stores/trackAudioStore.ts` | Routing audio par piste, EQ/Reverb par piste, instruments    |
| `audioBusStore`   | `stores/audioBusStore.ts`   | Bus audio master, EQ global, reverb global                   |

#### timelineStore - API

```typescript
// État
project: TimelineProject
activeTrackId: string | null
expandedTrackId: string | null  // Quelle piste a le piano roll ouvert

// Pistes
createTrack(instrument, name?): string
deleteTrack(trackId): boolean
updateTrack(trackId, updates): boolean
setTrackMuted(trackId, muted): boolean
setTrackSolo(trackId, solo): boolean
setTrackVolume(trackId, volume): boolean
setTrackReverb(trackId, reverb): boolean
updateTrackEQBand(trackId, bandId, gain): boolean

// Notes (directement sur la piste)
addNoteToTrack(trackId, note): string | null
removeNoteFromTrack(trackId, noteId): boolean
updateNoteInTrack(trackId, noteId, updates): boolean
setTrackNotes(trackId, notes[]): boolean

// Piano Roll expand/collapse
expandTrack(trackId): boolean
collapseTrack(): void
toggleTrackExpanded(trackId): void

// Playback
getPlayableTracks(): Track[]
getNotesAtPosition(notes, position): MidiNote[]
getTrackNotesAtPosition(trackId, position): MidiNote[]
```

### Types clés (`lib/utils/types.ts`)

```typescript
InstrumentType = "basicSynth" | "elementarySynth" | "smplr"
InstrumentConfig { type, oscillatorType?, soundfont?, preset?, gain? }

EQBand {
  id: string          // "sub", "bass", "mid", "presence", "brilliance"
  frequency: number   // Fréquence centrale
  gain: number        // -18 à +18 dB
  type: "lowshelf" | "peaking" | "highshelf"
  label: string       // Label affiché
}

Track {
  id, name, instrument, color, volume, reverb,
  eqBands: EQBand[],  // EQ 5 bandes par piste
  muted, solo, order,
  notes: MidiNote[]   // Notes avec positions absolues sur la timeline
  createdAt, updatedAt
}

MidiNote {
  i: string    // ID unique
  x: number    // Position absolue sur la timeline (en colonnes)
  y: number    // Hauteur de note (0-86, 0 = aigu)
  w: number    // Durée (en colonnes)
  h: number    // Toujours 1
}

TimelineProject {
  name, tracks: Track[], cols, tempo, volume, reverb, eqBands,
  version: "4.0", createdAt, updatedAt
}

TRACK_COLORS // Palette de couleurs pour les pistes
DEFAULT_EQ_BANDS // EQ 5 bandes par défaut (via cloneEQBands())
```

### Engines Audio (`lib/audio/engines/`)

Architecture modulaire avec classe de base abstraite :

```
engines/
  types.ts              # InstrumentEngine, EngineState, EngineStateCallback
  BaseEngine.ts         # Classe abstraite avec state management
  noteUtils.ts          # noteNameToFrequency() partagé
  index.ts              # Re-exports publics

  basic-synth/
    BasicSynthEngine.ts # Oscillateurs Web Audio (toujours ready)

  smplr/
    SmplrEngine.ts      # Soundfonts via `smplr` (128+ instruments)
    soundfonts.ts       # SOUNDFONT_LIST + SoundfontName
```

Factory : `lib/audio/instrumentFactory.ts` - Crée les instances d'engines selon le type.

#### Routing Audio par piste (`trackAudioStore`)

Chaque piste a sa propre chaîne audio :

```
Engine → GainNode (volume) → EQ Filters (5 bandes) → DryGain → inputBus
                                                   → WetGain → Convolver (reverb partagé)
```

- **EQ 5 bandes** : Sub (60Hz), Bass (200Hz), Mid (1000Hz), Presence (3000Hz), Brilliance (10000Hz)
- **Reverb** : Convolver partagé avec dry/wet mixing par piste
- Les watchers synchronisent automatiquement les changements du store vers les nodes audio

### Composants

#### Timeline (`components/app/timeline/`)

| Composant            | Rôle                                               |
| -------------------- | -------------------------------------------------- |
| `TimelineView.vue`   | Container principal, playback, orchestration       |
| `TrackRow.vue`       | Header + preview notes + piano roll inline         |
| `TimelineRuler.vue`  | Marqueurs de mesures cliquables                    |
| `AddTrackButton.vue` | Menu de sélection d'instrument                     |

#### Piano Roll (`components/app/pianoroll/`)

| Composant             | Rôle                                    |
| --------------------- | --------------------------------------- |
| `PianoRollInline.vue` | Éditeur de notes intégré sous la piste  |

#### Instruments (`components/app/instruments/`)

| Composant                | Rôle                                                    |
| ------------------------ | ------------------------------------------------------- |
| `InstrumentSettings.vue` | Panneau latéral : volume, reverb, EQ graphique, options |
| `TrackEqualizer.vue`     | Canvas EQ 5 bandes interactif (drag points)             |

### Vue principale

`views/app/BloopApp.vue` - Wrapper simple autour de `TimelineView`

## Flow utilisateur

1. **Ajouter une piste** : Bouton "+" → Menu avec 3 choix (Synth, Elementary, Sampler)
2. **Éditer les notes** : Double-clic sur la timeline d'une piste → Piano roll s'expand en dessous
3. **Ajouter une note** : Double-clic sur la grille du piano roll
4. **Supprimer une note** : Clic droit sur la note
5. **Configurer l'instrument** : Clic sur ⚙ d'une piste → Panneau latéral
6. **Playback** : Toutes les pistes jouent simultanément (respect mute/solo)

## Constantes partagées

```typescript
const COL_WIDTH = 20;            // Largeur d'une colonne (1 step)
const TRACK_HEADER_WIDTH = 180;  // Header sticky
const TRACK_PREVIEW_HEIGHT = 60; // Hauteur preview notes
const NOTE_ROW_HEIGHT = 16;      // Hauteur d'une note dans piano roll
const TOTAL_NOTES = 87;          // Notes disponibles (C0-B7)
```

## Points d'attention

### Bugs potentiels / À tester

- [ ] Synchronisation audio multi-pistes (timing précis)
- [x] Gestion mémoire des engines (dispose correct)
- [ ] Persistance localStorage avec le nouveau format v4.0
- [ ] ElementarySynth non implémenté (fallback sur BasicSynth)

### Bugs résolus

- **SmplrEngine pas de son** : Ne pas utiliser `markRaw()` sur l'objet Soundfont de smplr
- **Délai première note** : Système de preload implémenté

### Fonctionnalités manquantes

- [ ] Drag & drop des notes dans le piano roll
- [ ] Resize des notes (durée)
- [ ] Copier/coller de notes
- [ ] Undo/redo
- [ ] Export audio (WAV/MP3)
- [x] EQ/Reverb par piste (dans InstrumentSettings)
- [ ] Zoom timeline
- [ ] ADSR pour ElementarySynth

## Conventions de code

- **Stores** : Pinia avec Composition API
- **Composants** : Vue 3 `<script setup>` + TypeScript
- **Audio** : Classes TypeScript pures (pas de dépendance Vue)
- **Styling** : SCSS scoped avec variables CSS (`--color-*`)

### Pour ajouter un nouvel Engine

1. Créer un dossier `engines/mon-engine/`
2. Créer `MonEngine.ts` qui `extends BaseEngine`
3. Implémenter les méthodes abstraites : `preload()`, `playNote()`, `stopNote()`, `stopAllNotes()`, `updateConfig()`, `dispose()`
4. Créer `index.ts` pour re-exporter
5. Ajouter les re-exports dans `engines/index.ts`
6. Ajouter le case dans `instrumentFactory.ts`

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run lint:webapp  # Lint du frontend
```

## Dépendances clés

- `smplr` : Soundfonts pour les instruments samplés
- `pinia` : State management
