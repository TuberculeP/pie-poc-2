import { defineStore } from "pinia";
import type { User } from "../lib/utils/types";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<User>();
  const isAuthenticated = computed(() => !!user.value);

  return {
    user,
    isAuthenticated,
  };
});
