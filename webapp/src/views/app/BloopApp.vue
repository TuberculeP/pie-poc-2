<script setup lang="ts">
import BloopBasicSynth from "../../components/app/instruments/BloopBasicSynth.vue";
import { useMainStore } from "../../stores/mainStore";
import BloopElementarySynth from "../../components/app/instruments/BloopElementarySynth.vue";
import { storeToRefs } from "pinia";
import BloopSmplr from "../../components/app/instruments/BloopSmplr.vue";
import AppLayout from "../../layouts/AppLayout.vue";
import BloopNoteSequencer from "../../components/app/BloopNoteSequencer.vue";
import type { MidiNote, NoteName } from "../../lib/utils/types";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "../../stores/projectStore";
import { useSequencerStore } from "../../stores/sequencerStore";

const route = useRoute();
const projectStore = useProjectStore();
const sequencerStore = useSequencerStore();

const projectId = computed(() => route.query.projectId as string | undefined);
const isNewProject = computed(() => route.query.new === "true");

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

// Initialisation au montage
onMounted(async () => {
  // Si c'est un nouveau projet, reset le store
  if (isNewProject.value) {
    projectStore.createNewProject();
    sequencerStore.loadProjectData({
      sequences: [],
      activeSequenceId: null,
      projectName: "Nouveau projet",
      version: "2.1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    sequencerStore.createSequence("Ma première séquence");
  }

  // Charger l'audio
  await loadAll();
});
</script>

<template>
  <AppLayout>
    <div>
      <!-- Écran de chargement -->
      <div v-if="!isLoaded" class="loading-screen">
        <p>Chargement de l'application... {{ loadPercentage }}%</p>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${loadPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Séquenceur -->
      <div v-else>
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
        <BloopNoteSequencer
          :project-id="projectId"
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

/* Écran de chargement */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
  color: var(--color-text-secondary);
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: var(--color-bg-primary-dark);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
