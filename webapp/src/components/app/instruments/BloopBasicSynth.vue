<script setup lang="ts">
import BloopPotard from "../BloopPotard.vue";
import type { Note, NoteName, MidiNote } from "../../../lib/utils/types.ts";
import { useMIDIStore } from "../../../stores/MIDIStore.ts";
import { onBeforeUnmount, ref } from "vue";
import { watch } from "vue";

// Exposition des fonctions pour le séquenceur ET pour ouvrir la modal
defineExpose({
  playSequencerNote,
  stopSequencerNote,
  openNoteModal,
});

const MIDIStore = useMIDIStore();
const { onNotePlayed, onNoteStopped } = MIDIStore;
const audioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

const potardTest = ref(127);
const showModal = ref(false);
const currentMidiNote = ref<MidiNote | null>(null);

// Paramètres du son modifiables
const attack = ref(0.01);
const decay = ref(0.1);
const sustain = ref(0.7);
const release = ref(0.3);
const filterFrequency = ref(1000);
const filterResonance = ref(1);

watch(
  potardTest,
  (newValue) => {
    const gain = audioContext.createGain();
    gain.gain.value = newValue / 127;
    gain.connect(audioContext.destination);
    gain.gain.exponentialRampToValueAtTime(
      gain.gain.value,
      audioContext.currentTime + 0.03,
    );
  },
  { immediate: true },
);

const oscillators = ref<Record<number, any>>({});
const sequencerOscillators = ref<Record<string, any>>({});

const oscillatorType = ref<OscillatorType>("sine");

// Fonction pour convertir un nom de note en fréquence
function noteNameToFrequency(noteName: NoteName): number {
  const noteRegex = /^([A-G])(#?)(\d+)$/;
  const match = noteName.match(noteRegex);

  if (!match) {
    console.warn(`Invalid note name: ${noteName}`);
    return 440;
  }

  const [, note, sharp, octaveStr] = match;
  const octave = parseInt(octaveStr);

  const noteOffsets: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let semitone = noteOffsets[note];
  if (sharp === "#") {
    semitone += 1;
  }

  const midiNote = octave * 12 + semitone + 12;
  const a4MidiNote = 69;

  return 440 * Math.pow(2, (midiNote - a4MidiNote) / 12);
}

// Fonction pour convertir y (position verticale) en nom de note
function yPositionToNoteName(y: number): NoteName {
  // Cette fonction dépend de votre mapping
  // Exemple : si y=0 correspond à C5, y=1 à B4, etc.
  // Vous devrez adapter selon votre système
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor((60 - y) / 12) + 4; // Ajustez selon votre mapping
  const noteIndex = (60 - y) % 12;
  return `${notes[noteIndex]}${octave}` as NoteName;
}

// Fonction pour ouvrir la modal depuis la timeline
function openNoteModal(midiNote: MidiNote) {
  currentMidiNote.value = midiNote;
  showModal.value = true;
}

// Fonctions pour le système MIDI clavier (sans modal automatique)
function playNote(note: Note) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();
  
  // Configuration du filtre
  filterNode.type = "lowpass";
  filterNode.frequency.value = filterFrequency.value;
  filterNode.Q.value = filterResonance.value;

  // ADSR Envelope
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(potardTest.value / 127, now + attack.value);
  gainNode.gain.linearRampToValueAtTime(
    (potardTest.value / 127) * sustain.value,
    now + attack.value + decay.value
  );

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime);
  oscillator.start();
  oscillators.value[note.frequency] = { oscillator, gainNode };
}

function stopNote(note: Note) {
  const oscData = oscillators.value[note.frequency];
  if (oscData) {
    const { oscillator, gainNode } = oscData;
    const now = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + release.value);
    
    setTimeout(() => {
      oscillator.stop();
      delete oscillators.value[note.frequency];
    }, release.value * 1000);
  }
}

// Fonctions pour le séquenceur de notes
function playSequencerNote(noteName: NoteName, noteId: string) {
  const frequency = noteNameToFrequency(noteName);

  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  const filterNode = audioContext.createBiquadFilter();
  
  filterNode.type = "lowpass";
  filterNode.frequency.value = filterFrequency.value;
  filterNode.Q.value = filterResonance.value;

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(potardTest.value / 127, now + attack.value);

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.start();

  sequencerOscillators.value[noteId] = { oscillator, gainNode };
}

function stopSequencerNote(noteId: string) {
  const oscData = sequencerOscillators.value[noteId];
  if (oscData) {
    const { oscillator, gainNode } = oscData;
    const now = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + release.value);
    
    setTimeout(() => {
      oscillator.stop();
      delete sequencerOscillators.value[noteId];
    }, release.value * 1000);
  }
}

function closeModal() {
  showModal.value = false;
  currentMidiNote.value = null;
}

// Enregistrer les callbacks et récupérer les fonctions de déconnexion
const unregisterPlayCallback = onNotePlayed(playNote);
const unregisterStopCallback = onNoteStopped(stopNote);

// Se déconnecter quand le composant est démonté
onBeforeUnmount(() => {
  Object.values(oscillators.value).forEach((data: any) => {
    data.oscillator.stop();
  });
  Object.values(sequencerOscillators.value).forEach((data: any) => {
    data.oscillator.stop();
  });
  oscillators.value = {};
  sequencerOscillators.value = {};

  unregisterPlayCallback();
  unregisterStopCallback();
});
</script>

<template>
  <div>
    <h1>Bloop Basic Synth</h1>
    <select v-model="oscillatorType">
      <option value="sine">Sine</option>
      <option value="square">Square</option>
      <option value="sawtooth">Sawtooth</option>
      <option value="triangle">Triangle</option>
    </select>
    <BloopPotard v-model="potardTest" />
    '{{ potardTest }}
    
    <div class="synth-controls">
      <button @click="showModal = true" class="control-btn">
        Modifier la note
      </button>
    </div>

    <!-- Modal pour modifier le son -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Modifier le son</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="currentMidiNote" class="note-info">
            <p>Note ID : <strong>{{ currentMidiNote.i }}</strong></p>
            <p>Position : {{ currentMidiNote.x }}</p>
            <p>Hauteur (y) : {{ currentMidiNote.y }}</p>
            <p>Durée : {{ currentMidiNote.w }}</p>
          </div>

          <div class="parameter-group">
            <h3>Oscillateur</h3>
            <div class="control">
              <label>Type d'onde :</label>
              <select v-model="oscillatorType">
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
          </div>

          <div class="parameter-group">
            <h3>Enveloppe ADSR</h3>
            <div class="control">
              <label>Attack ({{ attack.toFixed(3) }}s) :</label>
              <input type="range" v-model.number="attack" min="0.001" max="2" step="0.001" />
            </div>
            <div class="control">
              <label>Decay ({{ decay.toFixed(3) }}s) :</label>
              <input type="range" v-model.number="decay" min="0.001" max="2" step="0.001" />
            </div>
            <div class="control">
              <label>Sustain ({{ sustain.toFixed(2) }}) :</label>
              <input type="range" v-model.number="sustain" min="0" max="1" step="0.01" />
            </div>
            <div class="control">
              <label>Release ({{ release.toFixed(3) }}s) :</label>
              <input type="range" v-model.number="release" min="0.001" max="5" step="0.001" />
            </div>
          </div>

          <div class="parameter-group">
            <h3>Filtre</h3>
            <div class="control">
              <label>Fréquence ({{ filterFrequency }} Hz) :</label>
              <input type="range" v-model.number="filterFrequency" min="20" max="20000" step="10" />
            </div>
            <div class="control">
              <label>Résonance ({{ filterResonance.toFixed(1) }}) :</label>
              <input type="range" v-model.number="filterResonance" min="0.0001" max="30" step="0.1" />
            </div>
          </div>

          <div class="parameter-group">
            <h3>Volume</h3>
            <BloopPotard v-model="potardTest" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.synth-controls {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  align-items: center;
}

.control-btn {
  padding: 8px 16px;
  background: #2a2a2a;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    border-color: #555;
  }

  &:active {
    background: #1a1a1a;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: #ffffff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 12px;

  h2 {
    margin: 0;
    font-size: 24px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    line-height: 1;

    &:hover {
      color: #fff;
    }
  }
}

.modal-body {
  .note-info {
    background: #252525;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;

    p {
      margin: 4px 0;
    }
  }

  .parameter-group {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      margin-bottom: 12px;
      color: #4a9eff;
    }

    .control {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #ccc;
      }

      input[type="range"] {
        width: 100%;
        height: 6px;
        background: #333;
        border-radius: 3px;
        outline: none;
        cursor: pointer;

        &::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;

          &:hover {
            background: #6ab0ff;
          }
        }

        &::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;
          border: none;

          &:hover {
            background: #6ab0ff;
          }
        }
      }

      select {
        width: 100%;
        padding: 8px;
        background: #252525;
        color: #fff;
        border: 1px solid #333;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #4a9eff;
        }
      }
    }
  }
}
</style>