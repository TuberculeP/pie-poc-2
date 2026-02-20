<script setup lang="ts">
import { useRouter } from "vue-router";
import AppLayout from "../../layouts/AppLayout.vue";
import ProjectSelector from "../../components/app/ProjectSelector.vue";

const router = useRouter();

const handleNewProject = () => {
  router.push({ name: "app-sequencer", query: { new: "true" } });
};

const handleSelectProject = (projectId: string) => {
  router.push({ name: "app-sequencer", query: { projectId } });
};
</script>

<template>
  <AppLayout>
    <ProjectSelector
      @new-project="handleNewProject"
      @select-project="handleSelectProject"
    />
  </AppLayout>
</template>
