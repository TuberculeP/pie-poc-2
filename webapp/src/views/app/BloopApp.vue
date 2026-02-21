<script setup lang="ts">
import { useMainStore } from "../../stores/mainStore";
import { storeToRefs } from "pinia";
import AppLayout from "../../layouts/AppLayout.vue";
import { TimelineView } from "../../components/app/timeline";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTimelineStore } from "../../stores/timelineStore";
import { useTrackAudioStore } from "../../stores/trackAudioStore";
import { useProjectStore } from "../../stores/projectStore";

const route = useRoute();
const router = useRouter();
const timelineStore = useTimelineStore();
const trackAudioStore = useTrackAudioStore();
const projectStore = useProjectStore();

const isNewProject = computed(() => route.query.new === "true");
const projectIdFromUrl = computed(
  () => route.query.projectId as string | undefined,
);

const loadError = ref<string | null>(null);

const mainStore = useMainStore();
const { isLoaded, loadPercentage } = storeToRefs(mainStore);

onMounted(async () => {
  if (!isLoaded.value) {
    router.replace({ name: "app-main" });
    return;
  }

  loadError.value = null;

  if (isNewProject.value) {
    // Nouveau projet
    projectStore.resetProject();
    timelineStore.createNewProject("Nouveau Projet");
  } else if (projectIdFromUrl.value) {
    // Charger depuis l'API
    const result = await projectStore.loadProjectToTimeline(
      projectIdFromUrl.value,
      timelineStore,
    );
    if (!result.success) {
      loadError.value = result.error || "Erreur lors du chargement";
      // Fallback: créer un nouveau projet
      projectStore.resetProject();
      timelineStore.createNewProject("Nouveau Projet");
    }
  } else {
    // Charger depuis localStorage (comportement par défaut)
    projectStore.resetProject();
    timelineStore.initialize();
  }

  trackAudioStore.initialize();
});

const handleSave = async () => {
  const result = await projectStore.saveProjectOnline(timelineStore.project);
  if (result.success && result.projectId) {
    // Mettre à jour l'URL avec le projectId
    router.replace({
      name: "app-sequencer",
      query: { projectId: result.projectId },
    });
  }
  return result;
};

const handleBackToProjects = () => {
  router.push({ name: "app-main" });
};

// Exposer les fonctions pour TimelineView
defineExpose({
  handleSave,
  handleBackToProjects,
});
</script>

<template>
  <AppLayout>
    <div class="app-container">
      <div v-if="!isLoaded" class="loading-screen">
        <p>Chargement de l'application... {{ loadPercentage }}%</p>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${loadPercentage}%` }"
          ></div>
        </div>
      </div>

      <div v-else class="timeline-wrapper">
        <TimelineView />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

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
