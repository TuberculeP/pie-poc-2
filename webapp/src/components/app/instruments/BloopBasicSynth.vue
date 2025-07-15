<script setup lang="ts">
import BloopPotard from "../BloopPotard.vue";
import type { Note } from "../../../lib/utils/types.ts";
import { useMIDIStore } from "../../../stores/MIDIStore.ts";
import { ref } from "vue";
import { watch } from "vue";
const MIDIStore = useMIDIStore();
const { onNotePlayed, onNoteStopped } = MIDIStore;
const audioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

const potardTest = ref(127);

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

const oscillatorType = ref<OscillatorType>("sine");

function playNote(note: Note) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = oscillatorType.value;
  oscillator.connect(audioContext.destination);
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

onNotePlayed(playNote);
onNoteStopped(stopNote);
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
