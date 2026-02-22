<template>
  <div class="app-layout">
    <header v-if="isAuthenticated" class="app-header">
      Bienvenue, {{ user?.firstName }}
      <button @click="disconnect">Déconnexion</button>
    </header>
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/authStore";
import apiClient from "../lib/utils/apiClient";

const { user, isAuthenticated } = storeToRefs(useAuthStore());

async function disconnect() {
  const result = await apiClient.post("/auth/logout");
  if (result.data) {
    console.log("Déconnexion réussie");
    user.value = undefined;
    window.location.reload();
  } else {
    console.error("Erreur lors de la déconnexion :", result.error);
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
}

.app-header {
  flex-shrink: 0;
  padding: 8px 16px;
  background: #2d0f20;
  color: #f2efe8;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(122, 15, 62, 0.5);
}

.app-header button {
  padding: 4px 12px;
  background: rgba(122, 15, 62, 0.5);
  border: 1px solid rgba(122, 15, 62, 0.8);
  border-radius: 4px;
  color: #f2efe8;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
}

.app-header button:hover {
  background: rgba(122, 15, 62, 0.8);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
