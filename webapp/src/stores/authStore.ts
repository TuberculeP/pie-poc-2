import { defineStore } from "pinia";
import type { User } from "../lib/utils/types";
import { ref, computed } from "vue";
import apiClient from "../lib/utils/apiClient";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<User>();
  const isAuthenticated = computed(() => !!user.value);
  const googleAuthEnabled = ref(false);

  async function loadConfig() {
    const config = await apiClient.get<{ googleAuthEnabled: boolean }>(
      "/auth/config",
    );
    if (config.data) {
      googleAuthEnabled.value = config.data.googleAuthEnabled;
    }
  }

  return {
    user,
    isAuthenticated,
    googleAuthEnabled,
    loadConfig,
  };
});
