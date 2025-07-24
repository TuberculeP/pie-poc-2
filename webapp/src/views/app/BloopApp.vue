<script setup lang="ts">
import BloopBasicSynth from "../../components/app/instruments/BloopBasicSynth.vue";
import { useMainStore } from "../../stores/mainStore";
import BloopElementarySynth from "../../components/app/instruments/BloopElementarySynth.vue";
import { storeToRefs } from "pinia";
import BloopSmplr from "../../components/app/instruments/BloopSmplr.vue";
import AppLayout from "../../layouts/AppLayout.vue";
import BloopNoteSequencer from "../../components/app/BloopNoteSequencer.vue";
import type { MidiNote, NoteName } from "../../lib/utils/types";
import { ref } from "vue";

const mainStore = useMainStore();
const { isLoaded, loadPercentage } = storeToRefs(mainStore);
const { loadAll } = mainStore;

const instruments = [
  {
    name: "Basic",
    component: BloopBasicSynth,
  },
  {
    name: "Elementary",
    component: BloopElementarySynth,
  },
  {
    name: "Smplr",
    component: BloopSmplr,
  },
];

const currentInstrument = ref<(typeof instruments)[number]["name"]>("Basic");

// Référence vers l'instrument actuel pour pouvoir l'appeler
const currentInstrumentRef = ref<any>(null);

const onNoteStart = (
  note: MidiNote,
  noteName: NoteName,
  position: number,
): void => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Note START Event:`, {
    noteId: note.i,
    noteName,
    position,
    duration: note.w,
    velocity: 100, // Vous pouvez ajouter une propriété velocity aux notes
  });

  // Jouer la note sur l'instrument actuel si il a les bonnes méthodes
  if (currentInstrumentRef.value?.playSequencerNote) {
    currentInstrumentRef.value.playSequencerNote(noteName, note.i);
  }
};

const onNoteEnd = (
  note: MidiNote,
  noteName: NoteName,
  position: number,
): void => {
  // eslint-disable-next-line no-console
  console.log(`🛑 Note END Event:`, {
    noteId: note.i,
    noteName,
    position,
    duration: note.w,
  });

  // Arrêter la note sur l'instrument actuel si il a les bonnes méthodes
  if (currentInstrumentRef.value?.stopSequencerNote) {
    currentInstrumentRef.value.stopSequencerNote(note.i);
  }
};
</script>

<template>
  <AppLayout>
    <div>
      <h1>App</h1>
      <p>App loading current state : {{ loadPercentage }}%</p>
      <button @click="loadAll">Start app</button>
      <div v-if="isLoaded">
        <div v-for="({ name }, i) in instruments" :key="`insttab-${i}`">
          <button @click="currentInstrument = name">{{ name }}</button>
        </div>
        <component
          ref="currentInstrumentRef"
          :is="
            instruments.find((inst) => inst.name === currentInstrument)
              ?.component
          "
        />
        <BloopNoteSequencer @note-start="onNoteStart" @note-end="onNoteEnd" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
button {
  &.active {
    background-color: red;
  }
}
</style>
