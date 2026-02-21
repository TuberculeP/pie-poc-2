<template>
  <div class="piano-roll-container">
    <!-- Header avec les mesures -->
    <div v-if="sequencerStore.activeSequence" class="header-section">
      <div class="note-labels-header"></div>
      <div class="timeline-header">
        <div v-for="measure in measures" :key="measure" class="measure-marker">
          {{ measure }}
        </div>
      </div>
    </div>

    <!-- Corps principal -->
    <div v-if="sequencerStore.activeSequence" class="main-section">
      <!-- Wrapper scrollable pour piano + grille -->
      <div class="scroll-wrapper">
        <!-- Labels des notes (piano keys) - Blanches puis Noires séparément -->
        <div class="note-labels">
          <!-- Touches blanches (z-index bas, pleine largeur) -->
          <div
            v-for="note in whiteKeys"
            :key="note"
            class="note-label white-key"
            :class="{
              'octave-start': isOctaveStart(note),
              'preview-active': activePreviewNotes.has(note),
            }"
            :style="getWhiteKeyStyle(note)"
            @mousedown.prevent="onPianoKeyMouseDown(note)"
            @mouseup="onPianoKeyMouseUp(note)"
            @mouseenter="onPianoKeyMouseEnter(note)"
            @mouseleave="onPianoKeyMouseLeave(note)"
            :title="`Note ${note} (Octave ${getOctaveNumber(note)})`"
          >
            <span class="note-name">{{ note }}</span>
            <span v-if="isOctaveStart(note)" class="octave-number">{{
              getOctaveNumber(note)
            }}</span>
          </div>
          <!-- Touches noires (z-index haut, alignées sur la grille) -->
          <div
            v-for="note in blackKeys"
            :key="note"
            class="note-label black-key"
            :class="{
              'preview-active': activePreviewNotes.has(note),
            }"
            :style="getBlackKeyStyle(note)"
            @mousedown.prevent="onPianoKeyMouseDown(note)"
            @mouseup="onPianoKeyMouseUp(note)"
            @mouseenter="onPianoKeyMouseEnter(note)"
            @mouseleave="onPianoKeyMouseLeave(note)"
            :title="`Note ${note}`"
          >
            <span class="note-name">{{ note }}</span>
          </div>
        </div>

        <!-- Grille MIDI -->
        <div class="grid-container">
          <GridLayout
            :layout="layout"
            :col-num="cols"
            :row-height="rowHeight"
            :max-rows="notes.length"
            :is-draggable="true"
            :is-resizable="true"
            :margin="[0, 0]"
            :vertical-compact="false"
            :prevent-collision="false"
            :use-css-transforms="true"
            :responsive="false"
            @layout-updated="onLayoutUpdated"
            @container-resized="onContainerResized"
            class="midi-grid"
            @dblclick="addNoteAtClick"
            @mousedown="startSelection"
            @mousemove="updateSelection"
            @mouseup="endSelection"
          >
            <GridItem
              v-for="item in layout"
              :key="item.i"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :data-id="item.i"
              class="midi-note"
              :class="[
                getNoteClass(item),
                { selected: selectedNotes.has(item.i) },
              ]"
              @contextmenu.prevent="deleteNote(item.i)"
              @click="handleNoteClick($event, item)"
              @mousedown="handleNoteMouseDown($event, item)"
            >
              <span class="note-content">{{ getNoteFromY(item.y) }}</span>
            </GridItem>

            <!-- Rectangle de sélection -->
            <div
              v-if="selectionRect"
              class="selection-rectangle"
              :style="{
                left: `${selectionRect.x}px`,
                top: `${selectionRect.y}px`,
                width: `${selectionRect.width}px`,
                height: `${selectionRect.height}px`,
              }"
            ></div>

            <!-- Barre de progression de lecture -->
            <div
              v-if="isPlaying || currentPosition > 0"
              class="playback-cursor"
              :style="{ left: `${(precisePosition / cols) * 1280}px` }"
            ></div>
          </GridLayout>

          <!-- Grille de fond - derrière le grid-layout -->
          <div class="background-grid">
            <div
              v-for="row in notes.length"
              :key="row"
              class="grid-row"
              :class="{
                'black-key-row': isBlackKey(notes[row - 1]),
                'octave-start-row': isOctaveStart(notes[row - 1]),
                'preview-highlight': activePreviewNotes.has(notes[row - 1]),
              }"
            >
              <div
                v-for="col in cols"
                :key="`${row}-${col}`"
                class="grid-cell"
                :class="{ 'beat-marker': (col - 1) % 4 === 0 }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si pas de séquence active -->
    <div v-if="!sequencerStore.activeSequence" class="no-sequence-message">
      <h3>Aucune séquence active</h3>
      <p>Créez une nouvelle séquence pour commencer à composer.</p>
    </div>

    <!-- Contrôles -->
    <div v-if="sequencerStore.activeSequence" class="controls">
      <button @click="clearAll" class="btn btn-danger">Effacer tout</button>

      <!-- Contrôles de sélection -->
      <div class="selection-controls">
        <button
          v-if="selectedNotes.size > 0"
          @click="deleteSelectedNotes"
          class="btn btn-warning"
        >
          🗑️ Supprimer sélection ({{ selectedNotes.size }})
        </button>
        <button
          v-if="selectedNotes.size > 0"
          @click="clearSelection"
          class="btn btn-secondary"
        >
          ✖️ Désélectionner
        </button>
        <div v-if="selectedNotes.size === 0" class="selection-help">
          💡 Glissez pour sélectionner une zone, ou Ctrl+clic pour sélectionner
          plusieurs notes
        </div>
      </div>

      <!-- Contrôles de simulation clavier -->
      <div class="keyboard-controls">
        <button
          @click="toggleKeyboardSimulation"
          class="btn"
          :class="enableKeyboardSimulation ? 'btn-success' : 'btn-secondary'"
        >
          ⌨️ {{ enableKeyboardSimulation ? "KEYS ON" : "KEYS OFF" }}
        </button>
      </div>

      <!-- Contrôles de sauvegarde en ligne -->
      <div class="file-controls">
        <button
          @click="saveOnline"
          class="btn btn-primary"
          :disabled="projectStore.isSaving"
          :class="{ 'btn-warning': projectStore.hasUnsavedChanges }"
        >
          {{
            projectStore.isSaving
              ? "💫 Sauvegarde..."
              : projectStore.hasUnsavedChanges
                ? "☁️ Sauvegarder*"
                : "☁️ Sauvegardé"
          }}
        </button>
      </div>

      <!-- Contrôles de lecture -->
      <div class="playback-controls">
        <button
          @click="togglePlayback"
          class="btn btn-primary"
          :class="{ 'btn-pause': isPlaying }"
        >
          {{ isPlaying ? "Pause" : "Play" }}
        </button>
        <button @click="stopPlayback" class="btn btn-secondary">Stop</button>
      </div>

      <div class="tempo-control">
        <label>BPM: {{ tempo }}</label>
        <input
          type="range"
          min="60"
          max="180"
          v-model="tempo"
          class="tempo-slider"
          @input="updateTempo"
        />
      </div>

      <!-- Position actuelle -->
      <div class="position-display">
        <span
          >{{ Math.floor(currentPosition / 4) + 1 }}:{{
            (currentPosition % 4) + 1
          }}</span
        >
      </div>
    </div>

    <BloopEffectsTabs />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { GridLayout, GridItem } from "grid-layout-plus";
import type { MidiNote, NoteName } from "../../lib/utils/types";
import { useMIDIStore } from "../../stores/MIDIStore";
import { useProjectStore } from "../../stores/projectStore";
import { useSequencerStore } from "../../stores/sequencerStore";
import BloopEffectsTabs from "./BloopEffectsTabs.vue";

// Props
interface Props {
  projectId?: string;
}

const props = defineProps<Props>();

// Événements émis par le composant
const emit = defineEmits<{
  noteStart: [note: MidiNote, noteName: NoteName, position: number];
  noteEnd: [note: MidiNote, noteName: NoteName, position: number];
}>();

// Stores
const midiStore = useMIDIStore();
const projectStore = useProjectStore();
const sequencerStore = useSequencerStore();

// Configuration des notes : 10 octaves complètes (C9 à C0) = 120 notes
// Chaque octave = 12 notes, total = 10 × 12 = 120
const generateNotes = (): NoteName[] => {
  const noteOrder = [
    "B",
    "A#",
    "A",
    "G#",
    "G",
    "F#",
    "F",
    "E",
    "D#",
    "D",
    "C#",
    "C",
  ];
  const result: NoteName[] = [];
  // De l'octave 9 (aigu) à l'octave 0 (grave)
  for (let octave = 9; octave >= 0; octave--) {
    for (const note of noteOrder) {
      result.push(`${note}${octave}` as NoteName);
    }
  }
  return result;
};

const notes: NoteName[] = generateNotes();

// Configuration de la grille
const rowHeight: number = 18; // Réduit légèrement pour que tout tienne mieux

// État des notes MIDI (maintenant géré par le store)
const layout = computed({
  get: () => sequencerStore.layout,
  set: (newLayout: MidiNote[]) => {
    sequencerStore.layout = newLayout;
  },
});

const tempo = computed({
  get: () => sequencerStore.tempo,
  set: (newTempo: number) => {
    sequencerStore.tempo = newTempo;
  },
});

const cols = computed(() => sequencerStore.cols);

// Compteur pour les nouveaux IDs (local au composant)
const nextNoteId = ref<number>(1000);

// État de lecture amélioré pour plus de fluidité
const isPlaying = ref<boolean>(false);
const currentPosition = ref<number>(0); // Position actuelle en colonnes (entier)
const precisePosition = ref<number>(0); // Position précise pour animation fluide (float)
const playbackStartTime = ref<number>(0);
const playbackAnimationId = ref<number | null>(null);
const activeNotes = ref<Set<string>>(new Set()); // Notes actuellement en train de jouer
const lastNoteCheckPosition = ref<number>(-1); // Dernière position où on a vérifié les notes

// État simulation clavier
const enableKeyboardSimulation = ref<boolean>(true); // Simulation clavier activée par défaut

// État preview des notes (clic sur les touches piano)
const activePreviewNotes = ref<Set<NoteName>>(new Set());
const isMouseDownOnPiano = ref<boolean>(false);

// Fonction pour arrêter tous les previews (utilisée par handleGlobalMouseUp et onUnmounted)
const stopAllPreviewNotes = (): void => {
  activePreviewNotes.value.forEach((note) => {
    midiStore.stopNoteByName(note);
  });
  activePreviewNotes.value.clear();
};

// État de sélection multiple
const selectedNotes = ref<Set<string>>(new Set()); // Notes sélectionnées
const isSelecting = ref<boolean>(false); // Mode sélection en cours
const selectionStart = ref<{ x: number; y: number } | null>(null); // Point de départ de la sélection
const selectionEnd = ref<{ x: number; y: number } | null>(null); // Point de fin de la sélection
const selectionRect = ref<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null); // Rectangle de sélection visible

// État de déplacement groupé
const isDraggingGroup = ref<boolean>(false); // Déplacement de groupe en cours
const dragStartPositions = ref<Map<string, { x: number; y: number }>>(
  new Map(),
); // Positions initiales des notes
const draggedNoteId = ref<string | null>(null); // ID de la note qui initie le drag

// Contrôle clavier avec event listener natif
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    if (isPlaying.value) {
      stopPlayback(); // Reset au lieu de pause
    } else {
      startPlayback();
    }
  } else if (event.code === "Delete" || event.code === "Backspace") {
    event.preventDefault();
    if (selectedNotes.value.size > 0) {
      deleteSelectedNotes();
    }
  } else if (event.code === "Escape") {
    event.preventDefault();
    clearSelection();
  } else if ((event.ctrlKey || event.metaKey) && event.code === "KeyA") {
    event.preventDefault();
    // Sélectionner toutes les notes
    selectedNotes.value.clear();
    layout.value.forEach((note) => {
      selectedNotes.value.add(note.i);
    });
  }
};

const handleGlobalMouseUp = (): void => {
  // Nettoyer l'état de déplacement groupé quand on relâche la souris
  if (isDraggingGroup.value) {
    isDraggingGroup.value = false;
    draggedNoteId.value = null;
    dragStartPositions.value.clear();
  }

  // Arrêter les previews si on relâche en dehors du piano
  if (isMouseDownOnPiano.value) {
    isMouseDownOnPiano.value = false;
    stopAllPreviewNotes();
  }
};

onMounted(() => {
  // Initialiser le store du séquenceur
  sequencerStore.initialize();

  setTimeout(() => {
    sequencerStore.volume = 50;
    console.log("Volume forcé à 50%");
  }, 1000);

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("mouseup", handleGlobalMouseUp);
});

onUnmounted(() => {
  // Nettoyer les previews en cours
  stopAllPreviewNotes();

  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("mouseup", handleGlobalMouseUp);
});

// Mesures pour l'header
const measures = computed<number[]>(() => {
  const result: number[] = [];
  for (let i = 1; i <= cols.value / 4; i++) {
    result.push(i);
  }
  return result;
});

// Fonctions utilitaires
const isBlackKey = (note: NoteName): boolean => {
  return note.includes("#");
};

// Fonction pour déterminer si c'est le début d'une octave (note C)
const isOctaveStart = (note: NoteName): boolean => {
  return note.startsWith("C") && !note.includes("#");
};

// Fonction pour obtenir le numéro d'octave d'une note
const getOctaveNumber = (note: NoteName): number => {
  const match = note.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 4;
};

// Listes séparées des touches blanches et noires
const whiteKeys = computed(() => notes.filter((n) => !isBlackKey(n)));
const blackKeys = computed(() => notes.filter((n) => isBlackKey(n)));

// Multiplicateurs de hauteur pour les touches blanches (total = 12 lignes par octave)
const whiteKeyMultipliers: Record<string, number> = {
  C: 1.5,
  D: 2,
  E: 1.5,
  F: 1.5,
  G: 2,
  A: 2,
  B: 1.5,
};

// Style pour les touches blanches (empilées avec multiplicateurs)
const getWhiteKeyStyle = (note: NoteName) => {
  const whiteKeyIndex = whiteKeys.value.indexOf(note);
  const noteName = note.replace(/\d+$/, "");

  // Calculer la position top en accumulant les hauteurs des touches blanches précédentes
  let top = 0;
  for (let i = 0; i < whiteKeyIndex; i++) {
    const prevNote = whiteKeys.value[i];
    const prevName = prevNote.replace(/\d+$/, "");
    top += whiteKeyMultipliers[prevName] * rowHeight;
  }

  return {
    position: "absolute" as const,
    top: `${top}px`,
    height: `${whiteKeyMultipliers[noteName] * rowHeight}px`,
    width: "100%",
    left: "0",
    zIndex: 1,
  };
};

// Style pour les touches noires (alignées sur la grille)
const getBlackKeyStyle = (note: NoteName) => {
  const noteIndex = notes.indexOf(note);

  return {
    position: "absolute" as const,
    top: `${noteIndex * rowHeight}px`,
    height: `${rowHeight}px`,
    width: "55%",
    left: "0",
    zIndex: 2,
  };
};

const getNoteClass = (item: MidiNote) => {
  const note = getNoteFromY(item.y);
  return {
    "note-black": isBlackKey(note),
    "note-white": !isBlackKey(note),
  };
};

const getNoteFromY = (yPosition: number): NoteName => {
  return notes[yPosition] || "C4";
};

// Fonctions de sélection multiple
const startSelection = (event: MouseEvent): void => {
  // Ne pas démarrer la sélection si on clique sur une note ou si c'est un double-clic
  if ((event.target as Element).closest(".midi-note") || event.detail === 2) {
    return;
  }

  const gridElement = event.currentTarget as HTMLElement;
  const rect = gridElement.getBoundingClientRect();

  selectionStart.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  isSelecting.value = true;

  // Vider la sélection si pas de Ctrl
  if (!event.ctrlKey && !event.metaKey) {
    selectedNotes.value.clear();
  }
};

const updateSelection = (event: MouseEvent): void => {
  if (!isSelecting.value || !selectionStart.value) return;

  const gridElement = event.currentTarget as HTMLElement;
  const rect = gridElement.getBoundingClientRect();

  selectionEnd.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Calculer le rectangle de sélection
  const startX = Math.min(selectionStart.value.x, selectionEnd.value.x);
  const startY = Math.min(selectionStart.value.y, selectionEnd.value.y);
  const endX = Math.max(selectionStart.value.x, selectionEnd.value.x);
  const endY = Math.max(selectionStart.value.y, selectionEnd.value.y);

  selectionRect.value = {
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
  };
};

const endSelection = (_event: MouseEvent): void => {
  if (!isSelecting.value || !selectionStart.value || !selectionEnd.value) {
    isSelecting.value = false;
    selectionRect.value = null;
    return;
  }

  // Calculer les notes dans la zone de sélection
  const cellWidth = 1280 / cols.value; // Largeur d'une cellule
  const startCol = Math.floor(
    Math.min(selectionStart.value.x, selectionEnd.value.x) / cellWidth,
  );
  const endCol = Math.floor(
    Math.max(selectionStart.value.x, selectionEnd.value.x) / cellWidth,
  );
  const startRow = Math.floor(
    Math.min(selectionStart.value.y, selectionEnd.value.y) / rowHeight,
  );
  const endRow = Math.floor(
    Math.max(selectionStart.value.y, selectionEnd.value.y) / rowHeight,
  );

  // Sélectionner les notes dans la zone
  layout.value.forEach((note) => {
    if (
      note.x >= startCol &&
      note.x <= endCol &&
      note.y >= startRow &&
      note.y <= endRow
    ) {
      selectedNotes.value.add(note.i);
    }
  });

  // Nettoyer
  isSelecting.value = false;
  selectionRect.value = null;
  selectionStart.value = null;
  selectionEnd.value = null;
};

const handleNoteClick = (event: MouseEvent, note: MidiNote): void => {
  event.stopPropagation();

  if (event.ctrlKey || event.metaKey) {
    // Multi-sélection avec Ctrl
    if (selectedNotes.value.has(note.i)) {
      selectedNotes.value.delete(note.i);
    } else {
      selectedNotes.value.add(note.i);
    }
  } else {
    // Sélection simple
    selectedNotes.value.clear();
    selectedNotes.value.add(note.i);
  }
};

const handleNoteMouseDown = (_event: MouseEvent, note: MidiNote): void => {
  // Si on commence à draguer une note sélectionnée avec d'autres, préparer le déplacement groupé
  if (selectedNotes.value.has(note.i) && selectedNotes.value.size > 1) {
    isDraggingGroup.value = true;
    draggedNoteId.value = note.i;

    // Sauvegarder les positions initiales de toutes les notes sélectionnées
    dragStartPositions.value.clear();
    selectedNotes.value.forEach((noteId) => {
      const foundNote = layout.value.find((n) => n.i === noteId);
      if (foundNote) {
        dragStartPositions.value.set(noteId, {
          x: foundNote.x,
          y: foundNote.y,
        });
      }
    });
  } else {
    // Déplacement simple d'une seule note
    isDraggingGroup.value = false;
    draggedNoteId.value = null;
  }
};

const clearSelection = (): void => {
  selectedNotes.value.clear();
};

const deleteSelectedNotes = (): void => {
  selectedNotes.value.forEach((noteId) => {
    deleteNote(noteId);
  });
  selectedNotes.value.clear();
};

// Fonctions d'interaction - Preview des notes (maintenir clic + glissando)
const playPreviewNote = (note: NoteName): void => {
  if (activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.add(note);
  midiStore.playNoteByName(note);
};

const stopPreviewNote = (note: NoteName): void => {
  if (!activePreviewNotes.value.has(note)) return;
  activePreviewNotes.value.delete(note);
  midiStore.stopNoteByName(note);
};

const onPianoKeyMouseDown = (note: NoteName): void => {
  isMouseDownOnPiano.value = true;
  playPreviewNote(note);
};

const onPianoKeyMouseUp = (note: NoteName): void => {
  isMouseDownOnPiano.value = false;
  stopPreviewNote(note);
};

const onPianoKeyMouseEnter = (note: NoteName): void => {
  if (isMouseDownOnPiano.value) {
    playPreviewNote(note);
  }
};

const onPianoKeyMouseLeave = (note: NoteName): void => {
  stopPreviewNote(note);
};

const addNoteAtClick = (event: MouseEvent): void => {
  // Vérifier que c'est bien un double-clic sur une zone vide
  if ((event.target as Element).closest(".midi-note")) {
    return; // Ne pas créer de note si on clique sur une note existante
  }

  const gridElement = event.currentTarget as HTMLElement;
  const rect = gridElement.getBoundingClientRect();

  // Calculer la position relative au conteneur grid-layout-plus
  const relativeX = event.clientX - rect.left;
  const relativeY = event.clientY - rect.top;

  // Convertir en coordonnées de grille
  const cellWidth = rect.width / cols.value;
  const x = Math.floor(relativeX / cellWidth);
  const y = Math.floor(relativeY / rowHeight);

  // eslint-disable-next-line no-console
  console.log(`Clic à: clientX=${event.clientX}, clientY=${event.clientY}`);
  // eslint-disable-next-line no-console
  console.log(
    `Rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`,
  );
  // eslint-disable-next-line no-console
  console.log(`Position calculée: x=${x}, y=${y}, cellWidth=${cellWidth}`);

  // Vérifier les limites
  if (x >= 0 && x < cols.value && y >= 0 && y < notes.length) {
    const activeSeq = sequencerStore.activeSequence;
    if (!activeSeq) return;

    const newNote: MidiNote = {
      i: sequencerStore.generateNoteId(activeSeq.id),
      x,
      y,
      w: 1,
      h: 1,
    };

    // eslint-disable-next-line no-console
    console.log("Nouvelle note créée:", newNote);
    layout.value.push(newNote);
  } else {
    // eslint-disable-next-line no-console
    console.log("Position hors limites:", {
      x,
      y,
      maxX: cols.value,
      maxY: notes.length,
    });
  }
};

const onContainerResized = (): void => {
  // Gérer les redimensionnements si nécessaire
};

const deleteNote = (noteId: string): void => {
  const index = layout.value.findIndex((note) => note.i === noteId);
  if (index !== -1) {
    layout.value.splice(index, 1);
  }
};

const clearAll = (): void => {
  stopPlayback();
  layout.value = [];
  selectedNotes.value.clear();
};

// Fonctions de lecture
const togglePlayback = (): void => {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = (): void => {
  isPlaying.value = true;
  playbackStartTime.value = performance.now();
  lastNoteCheckPosition.value = Math.floor(currentPosition.value) - 1;

  const animate = (timestamp: number): void => {
    if (!isPlaying.value) return;

    // Calculer la position basée sur le temps écoulé et le BPM
    const elapsed = timestamp - playbackStartTime.value;
    const beatsPerSecond = tempo.value / 60;
    const stepsPerSecond = beatsPerSecond * 4; // 16th notes
    const stepsElapsed = (elapsed / 1000) * stepsPerSecond;

    // Mettre à jour les positions
    precisePosition.value = currentPosition.value + stepsElapsed;
    const newIntegerPosition = Math.floor(precisePosition.value);

    // Vérifier si on a franchi une nouvelle position entière
    if (newIntegerPosition > lastNoteCheckPosition.value) {
      for (
        let pos = lastNoteCheckPosition.value + 1;
        pos <= newIntegerPosition;
        pos++
      ) {
        if (pos < cols.value) {
          playNotesAtPosition(pos);
        }
      }
      lastNoteCheckPosition.value = newIntegerPosition;
    }

    // Arrêter à la fin
    if (precisePosition.value >= cols.value) {
      stopPlayback();
      return;
    }

    playbackAnimationId.value = requestAnimationFrame(animate);
  };

  playbackAnimationId.value = requestAnimationFrame(animate);
};

const pausePlayback = (): void => {
  isPlaying.value = false;
  if (playbackAnimationId.value) {
    cancelAnimationFrame(playbackAnimationId.value);
    playbackAnimationId.value = null;
  }

  // Sauvegarder la position actuelle pour reprendre où on s'était arrêté
  currentPosition.value = Math.floor(precisePosition.value);
};

const stopPlayback = (): void => {
  // Arrêter toutes les notes actuellement en cours
  activeNotes.value.forEach((noteId) => {
    const note = layout.value.find((n) => n.i === noteId);
    if (note) {
      const noteName = getNoteFromY(note.y);
      emit("noteEnd", note, noteName, currentPosition.value);

      // Simuler relâchement clavier si activé
      if (enableKeyboardSimulation.value) {
        midiStore.simulateKeyRelease(noteName);
      }
    }
  });

  // Vider la liste des notes actives
  activeNotes.value.clear();

  // Retirer l'effet visuel sur le piano
  activePreviewNotes.value.clear();

  pausePlayback();
  currentPosition.value = 0;
  precisePosition.value = 0;
};

const updateTempo = (): void => {
  // Si on est en train de jouer, redémarrer avec le nouveau tempo
  if (isPlaying.value) {
    pausePlayback();
    startPlayback();
  }
};

const playNotesAtPosition = (position: number): void => {
  // 1. D'ABORD arrêter les notes qui se terminent à cette position
  // IMPORTANT: On doit arrêter les notes AVANT d'en démarrer de nouvelles
  // pour éviter un bug où deux notes identiques consécutives s'arrêtent mal
  const notesToStop = layout.value.filter((note) => {
    const endPosition = note.x + note.w;
    return endPosition === position && activeNotes.value.has(note.i);
  });

  notesToStop.forEach((note) => {
    const noteName = getNoteFromY(note.y);

    // Retirer la note des notes actives
    activeNotes.value.delete(note.i);

    // Retirer l'effet visuel sur le piano
    activePreviewNotes.value.delete(noteName);

    // Événement : Note se termine (pour les instruments internes)
    emit("noteEnd", note, noteName, position);
    _markNoteAsPlaying(note.i, false);

    // Simuler relâchement clavier si activé
    if (enableKeyboardSimulation.value) {
      midiStore.simulateKeyRelease(noteName);
    }

    // eslint-disable-next-line no-console
    console.info(`🎵 End: ${noteName} (${note.i}) at position ${position}`);
  });

  // 2. ENSUITE démarrer les nouvelles notes à cette position
  const notesToStart = layout.value.filter((note) => note.x === position);

  notesToStart.forEach((note) => {
    const noteName = getNoteFromY(note.y);

    // Marquer la note comme active
    activeNotes.value.add(note.i);

    // Ajouter l'effet visuel sur le piano
    activePreviewNotes.value.add(noteName);

    // Événement : Note commence (pour les instruments internes)
    emit("noteStart", note, noteName, position);
    _markNoteAsPlaying(note.i, true);

    // Simuler appui clavier si activé (pour instruments qui écoutent le clavier)
    if (enableKeyboardSimulation.value) {
      midiStore.simulateKeyPress(noteName);
    }

    // eslint-disable-next-line no-console
    console.info(`🎵 Start: ${noteName} (${note.i}) at position ${position}`);
  });
};

// Événements de notes

// Fonction utilitaire pour marquer visuellement les notes en cours de lecture
const _markNoteAsPlaying = (noteId: string, isPlaying: boolean): void => {
  // Cette fonction peut être utilisée pour changer l'apparence des notes
  // pendant qu'elles jouent (changement de couleur, animation, etc.)

  // eslint-disable-next-line no-console
  console.log(
    `🎨 Visual marker for note ${noteId}: ${isPlaying ? "PLAYING" : "STOPPED"}`,
  );

  // Trouver l'élément DOM de la note
  const noteElement = document.querySelector(`[data-id="${noteId}"]`);
  if (noteElement) {
    if (isPlaying) {
      noteElement.classList.add("playing");
    } else {
      noteElement.classList.remove("playing");
    }
  }
};

const onLayoutUpdated = (newLayout: MidiNote[]): void => {
  // Si on est en train de déplacer un groupe
  if (isDraggingGroup.value && draggedNoteId.value) {
    const draggedNote = newLayout.find(
      (note) => note.i === draggedNoteId.value,
    );
    const originalPosition = dragStartPositions.value.get(draggedNoteId.value!);

    if (draggedNote && originalPosition) {
      // Calculer le décalage
      const deltaX = draggedNote.x - originalPosition.x;
      const deltaY = draggedNote.y - originalPosition.y;

      // Appliquer le même décalage à toutes les notes sélectionnées
      selectedNotes.value.forEach((noteId) => {
        if (noteId !== draggedNoteId.value) {
          const note = newLayout.find((n) => n.i === noteId);
          const startPos = dragStartPositions.value.get(noteId);

          if (note && startPos) {
            note.x = Math.max(0, Math.min(cols.value - 1, startPos.x + deltaX));
            note.y = Math.max(
              0,
              Math.min(notes.length - 1, startPos.y + deltaY),
            );
          }
        }
      });
    }
  }

  layout.value = newLayout;
};

// Anciennes fonctions de sauvegarde/chargement supprimées
// Maintenant gérées par BloopSequenceTabs et useSequencerStore

// Fonctions MIDI
const toggleKeyboardSimulation = (): void => {
  enableKeyboardSimulation.value = !enableKeyboardSimulation.value;
  // eslint-disable-next-line no-console
  console.log(
    `Keyboard Simulation: ${enableKeyboardSimulation.value ? "Enabled" : "Disabled"}`,
  );
};

// Fonction de sauvegarde en ligne
const saveOnline = async (): Promise<void> => {
  if (!sequencerStore.activeSequence) {
    alert("❌ Aucune séquence active à sauvegarder");
    return;
  }

  const result = await projectStore.saveProjectOnlineLegacy(
    sequencerStore.project,
    notes,
    enableKeyboardSimulation.value,
  );

  if (result.success) {
    const action = projectStore.currentProjectId ? "mis à jour" : "créé";
    alert(`✅ Projet ${action} en ligne avec succès!`);

    // Mettre à jour l'URL avec le projectId (nouveau projet ou projet existant)
    if (result.projectId) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("projectId", result.projectId);
      window.history.replaceState({}, "", newUrl);
    }
  } else {
    alert(`❌ ${result.error}`);
  }
};

// Charger un projet depuis l'URL
const loadProjectFromUrl = async (): Promise<void> => {
  if (!props.projectId) return;

  const result = await projectStore.loadProjectToSequencer(
    props.projectId,
    sequencerStore,
    enableKeyboardSimulation,
    nextNoteId,
  );

  if (!result.success) {
    alert(`❌ ${result.error}`);
  }
};

// Watcher pour charger le projet quand l'ID change
watch(() => props.projectId, loadProjectFromUrl, { immediate: true });

// Watcher pour détecter les changements dans le séquenceur
watch(
  [() => sequencerStore.project, enableKeyboardSimulation],
  () => {
    projectStore.checkForChanges(
      sequencerStore.project,
      enableKeyboardSimulation.value,
    );
  },
  { deep: true },
);

// Protection contre la fermeture de page avec changements non sauvegardés
onMounted(() => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (projectStore.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = "Vous avez des modifications non sauvegardées.";
      return event.returnValue;
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  onUnmounted(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
});
</script>

<style scoped>
.piano-roll-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary-dark);
  font-family: "Arial", sans-serif;
  user-select: none;
  -webkit-user-select: none;
}

.no-sequence-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #ccc;
  text-align: center;
  padding: 40px;
}

.no-sequence-message h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--color-primary);
}

.no-sequence-message p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.header-section {
  display: flex;
  border-bottom: 2px solid #333;
  background-color: #2a2a2a;
}

.note-labels-header {
  width: 80px;
  background-color: #2a2a2a;
  border-right: 2px solid #333;
}

.timeline-header {
  flex: 1;
  display: flex;
  background-color: #2a2a2a;
  color: white;
  height: 40px;
  overflow-x: auto;
  overflow-y: hidden;
}

.measure-marker {
  flex: 0 0 auto;
  min-width: 80px; /* Largeur fixe pour chaque mesure */
  width: 80px;
  border-right: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.main-section {
  display: flex;
  height: 500px; /* Hauteur fixe pour le piano roll */
}

.scroll-wrapper {
  display: flex;
  flex: 1;
  overflow: auto;
}

.note-labels {
  flex-shrink: 0;
  width: 80px;
  background-color: #2a2a2a;
  border-right: 2px solid #333;
  position: relative;
  min-height: 2160px; /* 120 notes × 18px */
}

.note-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 4px;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.1s;
  box-sizing: border-box;
}

/* Touches blanches - pleine largeur, z-index bas */
.note-label.white-key {
  background: linear-gradient(to left, #e8e8e8 0%, #f5f5f5 50%, #e0e0e0 100%);
  color: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid #bbb;
  border-radius: 0 0 3px 3px;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.1);
}

.note-label.white-key:hover {
  background: linear-gradient(to left, #f0f0f0 0%, #fff 50%, #e8e8e8 100%);
}

.note-label.white-key.octave-start {
  border-bottom: 2px solid #222;
}

/* Touches noires - plus étroites, z-index haut, sur la droite */
.note-label.black-key {
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 60%, #0a0a0a 100%);
  color: rgba(255, 255, 255, 0.25);
  border-radius: 0 0 2px 2px;
  box-shadow:
    inset 0 -3px 5px rgba(0, 0, 0, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  justify-content: center;
  padding-right: 0;
}

.note-label.black-key:hover {
  background: linear-gradient(to bottom, #3a3a3a 0%, #2a2a2a 60%, #1a1a1a 100%);
}

/* Preview actif */
.note-label.white-key.preview-active {
  background: var(--color-primary) !important;
  color: white !important;
}

.note-label.preview-active.black-key {
  background: #6d28d9 !important;
  color: white !important;
}

.note-name {
  text-align: right;
  font-size: 10px;
}

.black-key .note-name {
  font-size: 8px;
  text-align: center;
}

.octave-number {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.3);
  font-weight: bold;
  margin-left: 3px;
}

.grid-container {
  position: relative;
  background-color: var(--color-bg-primary-dark);
}

.midi-grid {
  position: relative;
  z-index: 10;
  width: 1280px; /* Largeur fixe pour 16 mesures (80px * 16) */
  height: 100%;
  min-height: 2160px; /* 120 notes × 18px */
}

.midi-note {
  background-color: #5a9fd4;
  border: 1px solid #6db3e8;
  border-radius: 3px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.midi-note:hover {
  background-color: #6db3e8;
  transform: scale(1.02);
}

.midi-note.note-black {
  background-color: #8b5cf6;
  border-color: #a78bfa;
}

.midi-note.note-black:hover {
  background-color: #a78bfa;
}

.midi-note.selected {
  background-color: var(--color-warning) !important;
  border-color: var(--color-warning-hover) !important;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5) !important;
}

.midi-note.note-black.selected {
  background-color: var(--color-warning-active) !important;
  border-color: var(--color-warning-hover) !important;
}

.selection-rectangle {
  position: absolute;
  border: 2px dashed var(--color-primary);
  background-color: rgba(51, 122, 183, 0.1);
  pointer-events: none;
  z-index: 15;
}

.midi-note.playing {
  background-color: var(--color-validate) !important;
  border-color: var(--color-validate-hover) !important;
  box-shadow: 0 0 15px rgba(96, 189, 97, 0.6) !important;
  animation: noteGlow 0.5s ease-in-out infinite alternate;
}

@keyframes noteGlow {
  from {
    box-shadow: 0 0 15px rgba(96, 189, 97, 0.6);
  }
  to {
    box-shadow: 0 0 25px rgba(96, 189, 97, 0.9);
  }
}

.note-content {
  font-size: 10px;
  font-weight: bold;
  color: var(--color-white);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  height: 2160px; /* 120 notes × 18px */
  width: 1280px; /* Même largeur que midi-grid */
}

.grid-row {
  display: flex;
  height: 18px;
  border-bottom: 1px solid #333;
  pointer-events: none;
}

.grid-row.octave-start-row {
  border-bottom: 2px solid rgba(0, 0, 0, 0.5);
}

.grid-row.black-key-row {
  background-color: #0d0d0d;
}

.grid-row:not(.black-key-row) {
  background-color: #1a1a1a;
}

.grid-row.preview-highlight {
  background-color: rgba(51, 122, 183, 0.15) !important;
}

.grid-cell {
  flex: 1;
  border-left: 1px solid #2a2a2a;
  pointer-events: none;
}

.grid-cell.beat-marker {
  border-left: 1px solid #555;
}

.grid-cell.beat-marker:first-of-type {
  border: none;
}

.grid-cell:last-of-type {
  border-right: 1px solid #555;
}

.playback-cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-error);
  z-index: 20; /* Plus haut que les notes (z-index: 15) */
  pointer-events: none;
  box-shadow: 0 0 8px rgba(238, 53, 53, 0.6);
  height: 2160px; /* 120 notes × 18px */
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #2a2a2a;
  border-top: 2px solid #333;
}

.playback-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.file-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.selection-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.selection-help {
  font-size: 12px;
  color: var(--color-secondary);
  font-style: italic;
}

.btn-warning {
  background-color: var(--color-warning);
  color: var(--color-black);
}

.btn-warning:hover {
  background-color: var(--color-warning-hover);
  transform: translateY(-1px);
}

.keyboard-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.midi-channel-select {
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #333;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.midi-channel-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
}

.btn-danger:hover {
  background-color: var(--color-error-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.btn-secondary:hover {
  background-color: var(--color-secondary-hover);
  transform: translateY(-1px);
}

.btn-pause {
  background-color: var(--color-warning-active) !important;
}

.btn-pause:hover {
  background-color: var(--color-warning-hover) !important;
}

.btn-success {
  background-color: var(--color-validate);
  color: var(--color-white);
}

.btn-success:hover {
  background-color: var(--color-validate-hover);
  transform: translateY(-1px);
}

.btn-info {
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-info:hover {
  background-color: var(--color-success-hover);
  transform: translateY(-1px);
}

.position-display {
  display: flex;
  align-items: center;
  color: white;
  font-family: "Courier New", monospace;
  font-weight: bold;
  font-size: 14px;
  background-color: #1a1a1a;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #444;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.tempo-control label {
  font-weight: bold;
  font-size: 14px;
}

.tempo-slider {
  width: 120px;
  accent-color: var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .note-labels {
    width: 60px;
  }

  .note-labels-header {
    width: 60px;
  }

  .note-label {
    font-size: 8px;
  }

  .controls {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
