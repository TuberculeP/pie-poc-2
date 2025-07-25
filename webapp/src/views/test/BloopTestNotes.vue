<template>
  <div class="piano-roll-container">
    <!-- Header avec les mesures -->
    <div class="header-section">
      <div class="note-labels-header"></div>
      <div class="timeline-header">
        <div
          v-for="measure in measures"
          :key="measure"
          class="measure-marker"
          :style="{ width: `${measureWidth}px` }"
        >
          {{ measure }}
        </div>
      </div>
    </div>

    <!-- Corps principal -->
    <div class="main-section">
      <!-- Labels des notes (piano keys) -->
      <div class="note-labels">
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
              :class="{ 'beat-marker': col % 4 === 1 }"
            ></div>
          </div>
        </div>

        <!-- Barre de progression de lecture -->
        <div
          v-if="isPlaying || currentPosition > 0"
          class="playback-cursor"
          :style="{ left: `${(precisePosition / cols) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Contrôles -->
    <div class="controls">
      <button @click="clearAll" class="btn btn-danger">Effacer tout</button>

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

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { GridLayout, GridItem } from "grid-layout-plus";

// Configuration des notes (piano keys)
const notes = [
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
const cols = 64; // 16 mesures x 4 beats
const rowHeight = 20;
const measureWidth = 256; // Largeur fixe pour les mesures

// État des notes MIDI
const layout = ref([
  // Quelques notes d'exemple pour tester
  { i: "note-demo-1", x: 0, y: 5, w: 1, h: 1 },
  { i: "note-demo-2", x: 4, y: 8, w: 2, h: 1 },
  { i: "note-demo-3", x: 8, y: 12, w: 1, h: 1 },
]);
const nextNoteId = ref(4);
const tempo = ref(120);

// État de lecture amélioré pour plus de fluidité
const isPlaying = ref(false);
const currentPosition = ref(0); // Position actuelle en colonnes (entier)
const precisePosition = ref(0); // Position précise pour animation fluide (float)
const playbackStartTime = ref(0);
const playbackAnimationId = ref(null);
const activeNotes = ref(new Set()); // Notes actuellement en train de jouer
const lastNoteCheckPosition = ref(-1); // Dernière position où on a vérifié les notes

// Contrôle clavier avec event listener natif
const handleKeyDown = (event) => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    togglePlayback();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

// Mesures pour l'header
const measures = computed(() => {
  const result = [];
  for (let i = 1; i <= cols / 4; i++) {
    result.push(i);
  }
  return result;
});

// Fonctions utilitaires
const isBlackKey = (note) => {
  return note.includes("#");
};

const getNoteClass = (item) => {
  const note = getNoteFromY(item.y);
  return {
    "note-black": isBlackKey(note),
    "note-white": !isBlackKey(note),
  };
};

const getNoteFromY = (yPosition) => {
  return notes[yPosition] || "C4";
};

// Fonctions d'interaction
const playNote = (note) => {
  // TODO: Intégrer votre synthé ou Web Audio API
  // eslint-disable-next-line no-console
  console.info(`Jouer note: ${note}`);
};

const addNoteAtClick = (event) => {
  // Vérifier que c'est bien un double-clic sur une zone vide
  if (event.target.closest(".midi-note")) {
    return; // Ne pas créer de note si on clique sur une note existante
  }

  const gridElement = event.currentTarget;
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
    const newNote = {
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

const onContainerResized = () => {
  // Gérer les redimensionnements si nécessaire
};

const deleteNote = (noteId) => {
  const index = layout.value.findIndex((note) => note.i === noteId);
  if (index !== -1) {
    layout.value.splice(index, 1);
  }
};

const clearAll = () => {
  stopPlayback();
  layout.value = [];
};

// Fonctions de lecture
const togglePlayback = () => {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = () => {
  isPlaying.value = true;
  playbackStartTime.value = performance.now();
  lastNoteCheckPosition.value = Math.floor(currentPosition.value) - 1;

  const animate = (timestamp) => {
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

const pausePlayback = () => {
  isPlaying.value = false;
  if (playbackAnimationId.value) {
    cancelAnimationFrame(playbackAnimationId.value);
    playbackAnimationId.value = null;
  }

  // Sauvegarder la position actuelle pour reprendre où on s'était arrêté
  currentPosition.value = Math.floor(precisePosition.value);
};

const stopPlayback = () => {
  // Arrêter toutes les notes actuellement en cours
  activeNotes.value.forEach((noteId) => {
    const note = layout.value.find((n) => n.i === noteId);
    if (note) {
      const noteName = getNoteFromY(note.y);
      onNoteEnd(note, noteName, currentPosition.value);
    }
  });

  // Vider la liste des notes actives
  activeNotes.value.clear();

  pausePlayback();
  currentPosition.value = 0;
  precisePosition.value = 0;
};

const updateTempo = () => {
  // Si on est en train de jouer, redémarrer avec le nouveau tempo
  if (isPlaying.value) {
    pausePlayback();
    startPlayback();
  }
};

const playNotesAtPosition = (position) => {
  // 1. Démarrer les nouvelles notes à cette position
  const notesToStart = layout.value.filter((note) => note.x === position);

  notesToStart.forEach((note) => {
    const noteName = getNoteFromY(note.y);

    // Marquer la note comme active
    activeNotes.value.add(note.i);

    // Événement : Note commence
    onNoteStart(note, noteName, position);

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

    // Événement : Note se termine
    onNoteEnd(note, noteName, position);

    // eslint-disable-next-line no-console
    console.info(`🎵 End: ${noteName} (${note.i}) at position ${position}`);
  });
};

// Événements de notes
const onNoteStart = (note, noteName, position) => {
  // TODO: Actions à effectuer quand une note commence
  // Exemples :
  // - Jouer le son via synthé
  // - Changer la couleur de la note
  // - Déclencher des effets visuels
  // - Envoyer des données MIDI

  // eslint-disable-next-line no-console
  console.log(`🚀 Note START Event:`, {
    noteId: note.i,
    noteName,
    position,
    duration: note.w,
    velocity: 100, // Vous pouvez ajouter une propriété velocity aux notes
  });

  // Jouer la note
  playNote(noteName);

  // Exemple : Marquer visuellement la note comme active
  markNoteAsPlaying(note.i, true);
};

const onNoteEnd = (note, noteName, position) => {
  // TODO: Actions à effectuer quand une note se termine
  // Exemples :
  // - Arrêter le son
  // - Remettre la couleur normale
  // - Déclencher des effets de fin
  // - Envoyer note off MIDI

  // eslint-disable-next-line no-console
  console.log(`🛑 Note END Event:`, {
    noteId: note.i,
    noteName,
    position,
    duration: note.w,
  });

  // Exemple : Retirer le marquage visuel
  markNoteAsPlaying(note.i, false);
};

// Fonction utilitaire pour marquer visuellement les notes en cours de lecture
const markNoteAsPlaying = (noteId, isPlaying) => {
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

const onLayoutUpdated = (newLayout) => {
  layout.value = newLayout;
};
</script>

<style scoped>
.piano-roll-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
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
}

.measure-marker {
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
}

.note-labels {
  width: 80px;
  background-color: #333;
  border-right: 2px solid #444;
  overflow: hidden;
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
  background-color: #1a1a1a;
}

.midi-grid {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  min-height: 720px; /* 36 notes * 20px de hauteur */
}

.midi-note {
  background-color: #4a9eff;
  border: 1px solid #2d5aa0;
  border-radius: 3px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.midi-note:hover {
  background-color: #5bb3ff;
  transform: scale(1.02);
}

.midi-note.note-black {
  background-color: #ff6b4a;
  border-color: #cc472e;
}

.midi-note.note-black:hover {
  background-color: #ff7a5c;
}

.midi-note.playing {
  background-color: #2ed573 !important;
  border-color: #20bf6b !important;
  box-shadow: 0 0 15px rgba(46, 213, 115, 0.6) !important;
  animation: noteGlow 0.5s ease-in-out infinite alternate;
}

@keyframes noteGlow {
  from {
    box-shadow: 0 0 15px rgba(46, 213, 115, 0.6);
  }
  to {
    box-shadow: 0 0 25px rgba(46, 213, 115, 0.9);
  }
}

.note-content {
  font-size: 10px;
  font-weight: bold;
  color: white;
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
  background-color: #1a1a1a;
}

.grid-cell {
  flex: 1;
  border-right: 1px solid #2a2a2a;
  pointer-events: none;
}

.grid-cell.beat-marker {
  border-right: 1px solid #555;
}

.playback-cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ff4757;
  z-index: 15;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.6);
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

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4a9eff;
  color: white;
}

.btn-primary:hover {
  background-color: #5bb3ff;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #ff4757;
  color: white;
}

.btn-danger:hover {
  background-color: #ff6b7a;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #57606f;
  color: white;
}

.btn-secondary:hover {
  background-color: #747d8c;
  transform: translateY(-1px);
}

.btn-pause {
  background-color: #ffa502 !important;
}

.btn-pause:hover {
  background-color: #ff9500 !important;
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
  accent-color: #4a9eff;
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
