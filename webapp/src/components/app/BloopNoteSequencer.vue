<template>
  <div class="piano-roll-container">
    <!-- Header avec les mesures -->
    <div class="header-section">
      <div class="note-labels-header"></div>
      <div class="timeline-header">
        <div v-for="measure in measures" :key="measure" class="measure-marker">
          {{ measure }}
        </div>
      </div>
    </div>

    <!-- Corps principal -->
    <div class="main-section">
      <!-- Labels des notes (piano keys) -->
      <div ref="noteLabelsRef" class="note-labels">
        <div
          v-for="note in notes"
          :key="note"
          class="note-label"
          :class="{ 'black-key': isBlackKey(note) }"
          @click="playNote(note)"
        >
          {{ note }}
        </div>
      </div>

      <!-- Grille MIDI -->
      <div
        ref="gridContainerRef"
        class="grid-container"
        @scroll="syncVerticalScroll"
      >
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
            :class="getNoteClass(item)"
            @contextmenu.prevent="deleteNote(item.i)"
          >
            <span class="note-content">{{ getNoteFromY(item.y) }}</span>
          </GridItem>

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
            :class="{ 'black-key-row': isBlackKey(notes[row - 1]) }"
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

    <!-- Contrôles -->
    <div class="controls">
      <button @click="clearAll" class="btn btn-danger">Effacer tout</button>

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

      <!-- Contrôles de fichiers -->
      <div class="file-controls">
        <button @click="saveSequence" class="btn btn-success">
          💾 Sauvegarder
        </button>
        <button @click="loadSequence" class="btn btn-info">📁 Charger</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineEmits } from "vue";
import { GridLayout, GridItem } from "grid-layout-plus";
import type { MidiNote, NoteName } from "../../lib/utils/types";
import { useMIDIStore } from "../../stores/MIDIStore";

// Événements émis par le composant
const emit = defineEmits<{
  noteStart: [note: MidiNote, noteName: NoteName, position: number];
  noteEnd: [note: MidiNote, noteName: NoteName, position: number];
}>();

// Store pour la simulation clavier/événements
const midiStore = useMIDIStore();

// Configuration des notes (piano keys)
const notes: NoteName[] = [
  "C6",
  "B5",
  "A#5",
  "A5",
  "G#5",
  "G5",
  "F#5",
  "F5",
  "E5",
  "D#5",
  "D5",
  "C#5",
  "C5",
  "B4",
  "A#4",
  "A4",
  "G#4",
  "G4",
  "F#4",
  "F4",
  "E4",
  "D#4",
  "D4",
  "C#4",
  "C4",
  "B3",
  "A#3",
  "A3",
  "G#3",
  "G3",
  "F#3",
  "F3",
  "E3",
  "D#3",
  "D3",
  "C#3",
];

// Configuration de la grille
const cols: number = 64; // 16 mesures x 4 beats (remis à la taille originale)
const rowHeight: number = 20;

// État des notes MIDI
const layout = ref<MidiNote[]>([
  // Quelques notes d'exemple pour tester
  { i: "note-demo-1", x: 0, y: 5, w: 1, h: 1 },
  { i: "note-demo-2", x: 4, y: 8, w: 2, h: 1 },
  { i: "note-demo-3", x: 8, y: 12, w: 1, h: 1 },
]);
const nextNoteId = ref<number>(4);
const tempo = ref<number>(120);

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

// Références pour synchroniser les scrolls
const noteLabelsRef = ref<HTMLElement | null>(null);
const gridContainerRef = ref<HTMLElement | null>(null);

// Synchroniser le scroll vertical entre les labels et la grille
const syncVerticalScroll = (event: Event): void => {
  const target = event.target as HTMLElement;
  if (target === gridContainerRef.value && noteLabelsRef.value) {
    noteLabelsRef.value.scrollTop = target.scrollTop;
  }
};

// Contrôle clavier avec event listener natif
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    if (isPlaying.value) {
      stopPlayback(); // Reset au lieu de pause
    } else {
      startPlayback();
    }
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

// Mesures pour l'header
const measures = computed<number[]>(() => {
  const result: number[] = [];
  for (let i = 1; i <= cols / 4; i++) {
    result.push(i);
  }
  return result;
});

// Fonctions utilitaires
const isBlackKey = (note: NoteName): boolean => {
  return note.includes("#");
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

// Fonctions d'interaction
const playNote = (note: NoteName): void => {
  // TODO: Intégrer votre synthé ou Web Audio API
  // eslint-disable-next-line no-console
  console.info(`Jouer note: ${note}`);
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
  const cellWidth = rect.width / cols;
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
  if (x >= 0 && x < cols && y >= 0 && y < notes.length) {
    const newNote: MidiNote = {
      i: `note-${nextNoteId.value++}`,
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
      maxX: cols,
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
        if (pos < cols) {
          playNotesAtPosition(pos);
        }
      }
      lastNoteCheckPosition.value = newIntegerPosition;
    }

    // Arrêter à la fin
    if (precisePosition.value >= cols) {
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
  // 1. Démarrer les nouvelles notes à cette position
  const notesToStart = layout.value.filter((note) => note.x === position);

  notesToStart.forEach((note) => {
    const noteName = getNoteFromY(note.y);

    // Marquer la note comme active
    activeNotes.value.add(note.i);

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

  // 2. Arrêter les notes qui se terminent à cette position
  const notesToStop = layout.value.filter((note) => {
    const endPosition = note.x + note.w;
    return endPosition === position && activeNotes.value.has(note.i);
  });

  notesToStop.forEach((note) => {
    const noteName = getNoteFromY(note.y);

    // Retirer la note des notes actives
    activeNotes.value.delete(note.i);

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
  layout.value = newLayout;
};

// Fonctions de sauvegarde et chargement
const saveSequence = (): void => {
  const sequenceData = {
    layout: layout.value,
    tempo: tempo.value,
    cols,
    timestamp: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(sequenceData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `sequence-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const loadSequence = (): void => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const sequenceData = JSON.parse(content);

        // Validation basique
        if (!sequenceData.layout || !Array.isArray(sequenceData.layout)) {
          throw new Error("Format de fichier invalide");
        }

        // Arrêter la lecture si en cours
        if (isPlaying.value) {
          stopPlayback();
        }

        // Charger les données
        layout.value = sequenceData.layout;
        if (sequenceData.tempo) {
          tempo.value = sequenceData.tempo;
        }

        // eslint-disable-next-line no-console
        console.log("Séquence chargée avec succès:", sequenceData);

        // Optionnel : mettre à jour nextNoteId pour éviter les conflits
        const maxId = Math.max(
          0,
          ...layout.value
            .map((note) => parseInt(note.i.replace(/\D/g, "")))
            .filter((id) => !isNaN(id)),
        );
        nextNoteId.value = maxId + 1;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Erreur lors du chargement:", error);
        alert("Erreur lors du chargement du fichier. Vérifiez le format JSON.");
      }
    };

    reader.readAsText(file);
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Fonctions MIDI
const toggleKeyboardSimulation = (): void => {
  enableKeyboardSimulation.value = !enableKeyboardSimulation.value;
  // eslint-disable-next-line no-console
  console.log(
    `Keyboard Simulation: ${enableKeyboardSimulation.value ? "Enabled" : "Disabled"}`,
  );
};
</script>

<style scoped>
.piano-roll-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-primary-dark);
  font-family: "Arial", sans-serif;
}

.header-section {
  display: flex;
  border-bottom: 2px solid #333;
  background-color: #2a2a2a;
}

.note-labels-header {
  width: 80px;
  background-color: #333;
  border-right: 2px solid #444;
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
  flex: 1;
  overflow: hidden;
  max-height: 70vh; /* Limiter la hauteur pour éviter le scroll global */
}

.note-labels {
  width: 80px;
  background-color: #333;
  border-right: 2px solid #444;
  overflow: hidden; /* Pas de scroll indépendant */
}

.note-label {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.1s;
}

.note-label:hover {
  background-color: #555;
}

.note-label.black-key {
  background-color: #222;
  color: #ccc;
}

.note-label:not(.black-key) {
  background-color: #444;
  color: white;
}

.grid-container {
  flex: 1;
  position: relative;
  overflow: auto;
  background-color: var(--color-bg-primary-dark);
  max-width: 100%;
}

.midi-grid {
  position: relative;
  z-index: 10;
  width: 1280px; /* Largeur fixe pour 16 mesures (80px * 16) */
  height: 100%;
  min-height: 720px; /* 36 notes * 20px de hauteur */
}

.midi-note {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary-hover);
  border-radius: 3px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.midi-note:hover {
  background-color: var(--color-primary-hover);
  transform: scale(1.02);
}

.midi-note.note-black {
  background-color: var(--color-accent);
  border-color: var(--color-accent-hover);
}

.midi-note.note-black:hover {
  background-color: var(--color-accent-hover);
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
  height: 720px; /* Même hauteur que midi-grid */
  width: 1280px; /* Même largeur que midi-grid */
}

.grid-row {
  display: flex;
  height: 20px;
  border-bottom: 1px solid #333;
  pointer-events: none;
}

.grid-row.black-key-row {
  background-color: #151515;
}

.grid-row:not(.black-key-row) {
  background-color: var(--color-bg-primary-dark);
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
  height: 720px; /* Hauteur exacte de la grille */
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
