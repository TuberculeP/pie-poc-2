<script setup lang="ts">
import BloopBasicSynth from "../../components/app/instruments/BloopBasicSynth.vue";
import { useMainStore } from "../../stores/mainStore";
import BloopElementarySynth from "../../components/app/instruments/BloopElementarySynth.vue";
import { storeToRefs } from "pinia";
import BloopSmplr from "../../components/app/instruments/BloopSmplr.vue";
import AppLayout from "../../layouts/AppLayout.vue";
import BloopNoteSequencer from "../../components/app/BloopNoteSequencer.vue";
import BloopArrangementView from "../../components/app/BloopArrangementView.vue";
import BloopSequenceTabs from "../../components/app/BloopSequenceTabs.vue";
import type { MidiNote, NoteName } from "../../lib/utils/types";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useSequencerStore } from "../../stores/sequencerStore";

// Route pour récupérer les query params
const route = useRoute();

// Computed pour récupérer le projectId depuis les query params
const projectId = computed(() => route.query.projectId as string | undefined);

// Store du séquenceur
const sequencerStore = useSequencerStore();

// Mode de vue (Pattern ou Arrangement)
const viewMode = ref<'pattern' | 'arrangement'>('pattern');

// Fonction pour basculer vers le mode Pattern et sélectionner une séquence
const editSequence = (sequenceId: string) => {
  sequencerStore.setActiveSequence(sequenceId);
  viewMode.value = 'pattern';
};

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
        <!-- Sélecteur d'instruments en onglets -->
        <div class="instrument-tabs">
          <button
            v-for="({ name }, i) in instruments"
            :key="`insttab-${i}`"
            @click="currentInstrument = name"
            class="instrument-tab"
            :class="{ active: currentInstrument === name }"
          >
            {{ name }}
          </button>
        </div>
        <component
          ref="currentInstrumentRef"
          :is="
            instruments.find((inst: any) => inst.name === currentInstrument)
              ?.component
          "
        />

        <!-- Tabs avec switch Pattern/Arrangement -->
        <BloopSequenceTabs
          v-model="viewMode"
          @edit-sequence="editSequence"
        />

        <!-- Vue Pattern (Piano Roll) -->
        <BloopNoteSequencer
          v-if="viewMode === 'pattern'"
          :project-id="projectId"
          @note-start="onNoteStart"
          @note-end="onNoteEnd"
        />

        <!-- Vue Arrangement (Playlist FL Studio style) -->
        <BloopArrangementView
          v-if="viewMode === 'arrangement'"
          @edit-sequence="editSequence"
          @note-start="onNoteStart"
          @note-end="onNoteEnd"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Onglets d'instruments */
.instrument-tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border-secondary);
  margin-bottom: 20px;
  background-color: var(--color-bg-primary-dark);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.instrument-tab {
  background: transparent;
  border: none;
  padding: 12px 24px;
  color: var(--color-white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  position: relative;
}

.instrument-tab:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-white);
}

.instrument-tab.active {
  background-color: var(--color-primary);
  color: var(--color-white);
  border-bottom-color: var(--color-accent);
}

.instrument-tab.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-accent);
}
</style>
