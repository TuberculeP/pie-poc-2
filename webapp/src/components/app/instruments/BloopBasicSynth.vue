<script setup lang="ts">
import BloopPotard from "../BloopPotard.vue";
import type { Note, NoteName } from "../../../lib/utils/types.ts";
import { useMIDIStore } from "../../../stores/MIDIStore.ts";
import { useSequencerStore } from "../../../stores/sequencerStore.ts";
import { onBeforeUnmount, ref } from "vue";
import { watch } from "vue";

// Exposition des fonctions pour le séquenceur
defineExpose({
  playSequencerNote,
  stopSequencerNote,
});

const MIDIStore = useMIDIStore();
const { onNotePlayed, onNoteStopped } = MIDIStore;
const sequencerStore = useSequencerStore();
const audioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

const potardTest = ref(127);

// Créer un gain node principal pour le volume global
const masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);
masterGainNode.gain.value = 0.3; // Valeur initiale

// Créer une reverb avec ConvolverNode
const convolver = audioContext.createConvolver();
const reverbGainNode = audioContext.createGain();
reverbGainNode.gain.value = 0; // Pas de reverb au démarrage

// Créer un impulse response simple pour la reverb
const impulseLength = audioContext.sampleRate * 3; // 3 secondes de reverb
const impulseResponse = audioContext.createBuffer(
  2,
  impulseLength,
  audioContext.sampleRate,
);
const impulseLeft = impulseResponse.getChannelData(0);
const impulseRight = impulseResponse.getChannelData(1);

// Générer une réponse impulsionnelle plus forte avec moins de bruit et plus d'amplitude
for (let i = 0; i < impulseLength; i++) {
  // Décroissance exponentielle lisse, amplifiée pour la reverb
  const decay = Math.pow(1 - i / impulseLength, 2.5);
  const randomNoise = Math.random() * 2 - 1;
  impulseLeft[i] = randomNoise * decay * 0.5; // Amplitude augmentée
  impulseRight[i] = randomNoise * decay * 0.5;
}

convolver.buffer = impulseResponse;

// Créer un gain boost pour la reverb
const reverbBoostGain = audioContext.createGain();
reverbBoostGain.gain.value = 1.5; // Amplifier le signal reverb

// Connecter le circuit de reverb : masterGain → convolver → boostGain → reverbGainNode → destination
masterGainNode.connect(convolver);
convolver.connect(reverbBoostGain);
reverbBoostGain.connect(reverbGainNode);
reverbGainNode.connect(audioContext.destination);

// Connecter également le signal direct (dry signal)
masterGainNode.connect(audioContext.destination);

watch(
  potardTest,
  (newValue) => {
    masterGainNode.gain.value = newValue / 127;
    masterGainNode.gain.exponentialRampToValueAtTime(
      newValue / 127,
      audioContext.currentTime + 0.03,
    );
  },
  { immediate: true },
);

// Écouter les changements du volume dans le store
watch(
  () => sequencerStore.volume,
  (newVolume) => {
    if (!Number.isFinite(newVolume)) return; // Ignorer les valeurs invalides
    const normalizedVolume = newVolume / 100; // Convertir 0-100 en 0-1
    if (normalizedVolume === 0) {
      // Pour 0, utiliser setValueAtTime car exponentialRamp ne supporte pas 0
      masterGainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    } else if (Number.isFinite(normalizedVolume)) {
      masterGainNode.gain.exponentialRampToValueAtTime(
        normalizedVolume,
        audioContext.currentTime + 0.05,
      );
    }
  },
);

// Écouter les changements de reverb dans le store
watch(
  () => sequencerStore.reverb,
  (newReverb) => {
    if (!Number.isFinite(newReverb)) return; // Ignorer les valeurs invalides
    const normalizedReverb = newReverb / 100; // Convertir 0-100 en 0-1
    if (normalizedReverb === 0) {
      // Pour 0, utiliser setValueAtTime
      reverbGainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    } else if (Number.isFinite(normalizedReverb)) {
      reverbGainNode.gain.exponentialRampToValueAtTime(
        normalizedReverb,
        audioContext.currentTime + 0.05,
      );
    }
  },
  { immediate: true }, // Initialiser avec la valeur du store au démarrage
);

const oscillators = ref<Record<number, any>>({});
const sequencerOscillators = ref<Record<string, any>>({}); // Pour les notes du séquenceur

const oscillatorType = ref<OscillatorType>("sine");

// Fonction pour convertir un nom de note en fréquence
function noteNameToFrequency(noteName: NoteName): number {
  const noteRegex = /^([A-G])(#?)(\d+)$/;
  const match = noteName.match(noteRegex);

  if (!match) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid note name: ${noteName}`);
    return 440; // Fallback sur A4
  }

  const [, note, sharp, octaveStr] = match;
  const octave = parseInt(octaveStr);

  // Table des notes avec leur offset depuis C
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

  // Calcul de la fréquence : A4 (440Hz) est notre référence
  // MIDI note 69 = A4
  const midiNote = octave * 12 + semitone + 12; // +12 car C0 = MIDI note 12
  const a4MidiNote = 69;

  return 440 * Math.pow(2, (midiNote - a4MidiNote) / 12);
}

// Fonctions pour le système MIDI clavier
function playNote(note: Note) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = potardTest.value / 127;

  oscillator.connect(gainNode);
  gainNode.connect(masterGainNode);
  oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime);
  oscillator.start();
  oscillators.value[note.frequency] = oscillator;
}

function stopNote(note: Note) {
  const oscillator = oscillators.value[note.frequency];
  if (oscillator) {
    oscillator.stop();
    delete oscillators.value[note.frequency];
  }
}

// Fonctions pour le séquenceur de notes
function playSequencerNote(noteName: NoteName, noteId: string) {
  const frequency = noteNameToFrequency(noteName);

  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = potardTest.value / 127;

  oscillator.connect(gainNode);
  gainNode.connect(masterGainNode);
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.start();

  sequencerOscillators.value[noteId] = oscillator;
}

function stopSequencerNote(noteId: string) {
  const oscillator = sequencerOscillators.value[noteId];
  if (oscillator) {
    oscillator.stop();
    delete sequencerOscillators.value[noteId];
  }
}

// Enregistrer les callbacks et récupérer les fonctions de déconnexion
const unregisterPlayCallback = onNotePlayed(playNote);
const unregisterStopCallback = onNoteStopped(stopNote);

// Se déconnecter quand le composant est démonté
onBeforeUnmount(() => {
  // Arrêter tous les oscillateurs en cours (clavier et séquenceur)
  Object.values(oscillators.value).forEach((oscillator) => {
    oscillator.stop();
  });
  Object.values(sequencerOscillators.value).forEach((oscillator) => {
    oscillator.stop();
  });
  oscillators.value = {};
  sequencerOscillators.value = {};

  // Déconnecter les callbacks du MIDIStore
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
    ‘{{ potardTest }}
  </div>
</template>

<style scoped lang="scss"></style>
