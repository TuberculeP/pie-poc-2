import { defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "display-ads";

export const useAdsStore = defineStore("ads", () => {
  const isEnabled = ref(localStorage.getItem(STORAGE_KEY) === "true");

  watch(isEnabled, (value) => {
    localStorage.setItem(STORAGE_KEY, String(value));
  });

  const enable = () => {
    isEnabled.value = true;
  };

  const disable = () => {
    isEnabled.value = false;
  };

  const toggle = () => {
    isEnabled.value = !isEnabled.value;
  };

  return {
    isEnabled,
    enable,
    disable,
    toggle,
  };
});
