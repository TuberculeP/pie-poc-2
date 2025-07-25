<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useElementaryStore } from "../../../stores/elementaryStore";
import { el } from "@elemaudio/core";
import { useMIDIStore } from "../../../stores/MIDIStore";
import { ref } from "vue";
import { watch } from "vue";
import { reactive } from "vue";
import { computed } from "vue";
import BloopPotard from "../BloopPotard.vue";

const elementaryStore = useElementaryStore();
const midiStore = useMIDIStore();

type Voice = {
  gate: number;
  key: string;
  freq: number;
};

const adsr = reactive({
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 5,
});

function computeFrequency(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

const voices = ref<Voice[]>(new Array<Voice>());

const computedVoices = computed(() =>
  voices.value.map((voice) => {
    const env = el.adsr(
      +adsr.attack,
      +adsr.decay,
      +adsr.sustain,
      +adsr.release,
      //   el.const({ key: `${voice.key}:a`, value: 0 }),
      //   el.const({ key: `${voice.key}:d`, value: 0 }),
      //   el.const({ key: `${voice.key}:s`, value: 1 }),
      //   el.const({ key: `${voice.key}:r`, value: 10 }),
      el.const({ key: `${voice.key}:gate`, value: 0.2 * voice.gate }),
    );

    return el.mul(
      env,
      el.cycle(el.const({ key: `${voice.key}:freq`, value: voice.freq })),
    );
  }),
);

watch(computedVoices, () => {
  const out = el.add(...computedVoices.value);
  elementaryStore.getCore().render(out, out);
});

// Fonctions de cleanup pour désenregistrer les callbacks
let unregisterNoteOn: (() => void) | null = null;
let unregisterNoteOff: (() => void) | null = null;

onMounted(() => {
  // S'abonner aux événements de notes du MIDIStore (clavier + séquenceur)
  unregisterNoteOn = midiStore.onNotePlayed((note, _key) => {
    const midiNoteNumber = midiNoteToNumber(note.scale);
    const key = "v" + midiNoteNumber;
    const freq = computeFrequency(midiNoteNumber);
    voices.value = voices.value
      .filter((voice: any) => voice.key !== key)
      .concat({ gate: 1, freq, key })
      .slice(-8);
  });

  unregisterNoteOff = midiStore.onNoteStopped((note, _key) => {
    const midiNoteNumber = midiNoteToNumber(note.scale);
    const key = "v" + midiNoteNumber;
    voices.value = voices.value.map((voice: any) =>
      voice.key === key ? { ...voice, gate: 0 } : voice,
    );
  });
});

onBeforeUnmount(() => {
  // Nettoyer les callbacks pour éviter les fuites mémoire
  if (unregisterNoteOn) {
    unregisterNoteOn();
  }
  if (unregisterNoteOff) {
    unregisterNoteOff();
  }
});

// Fonction pour convertir le nom de note en numéro MIDI
const midiNoteToNumber = (noteName: string): number => {
  const noteToNumber: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
  };

  const match = noteName.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60; // C4 par défaut

  const [, note, octave] = match;
  return (parseInt(octave) + 1) * 12 + noteToNumber[note];
};
</script>

<template>
  <p>Elementary</p>
  <div>
    <p>Attack ({{ adsr.attack }}s)</p>
    <BloopPotard :max="10" v-model="adsr.attack" :precision="2" />
    <p>Decay ({{ adsr.decay }}s)</p>
    <BloopPotard :max="10" v-model="adsr.decay" :precision="2" />
    <p>Sustain ({{ adsr.sustain }})</p>
    <BloopPotard :max="1" v-model="adsr.sustain" :precision="2" />
    <p>Release ({{ adsr.release }}s)</p>
    <BloopPotard :max="3" v-model="adsr.release" :precision="1" />
  </div>
</template>

<style scoped>
div {
  display: flex;
}
</style>
