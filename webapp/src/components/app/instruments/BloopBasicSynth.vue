<script setup lang="ts">
import BloopPotard from "../BloopPotard.vue";
import type { Note, NoteName } from "../../../lib/utils/types.ts";
import { useMIDIStore } from "../../../stores/MIDIStore.ts";
import { useAudioBusStore } from "../../../stores/audioBusStore.ts";
import { onBeforeUnmount, ref } from "vue";

defineExpose({
  playSequencerNote,
  stopSequencerNote,
});

const MIDIStore = useMIDIStore();
const { onNotePlayed, onNoteStopped } = MIDIStore;
const audioBusStore = useAudioBusStore();

const { audioContext, inputBus } = audioBusStore;

const potardTest = ref(127);

const oscillators = ref<Record<number, any>>({});
const sequencerOscillators = ref<Record<string, any>>({});

const oscillatorType = ref<OscillatorType>("sine");

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

function playNote(note: Note) {
  audioBusStore.ensureAudioContextResumed();

  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = potardTest.value / 127;

  oscillator.connect(gainNode);
  gainNode.connect(inputBus);
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

function playSequencerNote(noteName: NoteName, noteId: string) {
  audioBusStore.ensureAudioContextResumed();

  const frequency = noteNameToFrequency(noteName);

  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = potardTest.value / 127;

  oscillator.connect(gainNode);
  gainNode.connect(inputBus);
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

const unregisterPlayCallback = onNotePlayed(playNote);
const unregisterStopCallback = onNoteStopped(stopNote);

onBeforeUnmount(() => {
  Object.values(oscillators.value).forEach((oscillator) => {
    oscillator.stop();
  });
  Object.values(sequencerOscillators.value).forEach((oscillator) => {
    oscillator.stop();
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
  </div>
</template>

<style scoped lang="scss"></style>
