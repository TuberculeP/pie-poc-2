<template>
  <div>
    <div v-if="isAuthenticated">
      Bienvenue, {{ user?.firstName }}
      <button @click="disconnect">Déconnexion</button>
    </div>
    <slot />
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
    user.value = undefined; // Clear user data
    window.location.reload(); // Reload to reset state
  } else {
    console.error("Erreur lors de la déconnexion :", result.error);
  }
}
</script>
