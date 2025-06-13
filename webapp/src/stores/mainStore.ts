import { defineStore, storeToRefs } from "pinia";
import { useElementaryStore } from "./elementaryStore";
import { computed } from "vue";

export const useMainStore = defineStore("mainStore", () => {
  const elementaryStore = useElementaryStore();
  const { isLoaded: isElementaryStoreLoaded } = storeToRefs(elementaryStore);

  const loadPercentage = computed<number>(() => {
    const allLoadStates = [isElementaryStoreLoaded.value];

    return allLoadStates.reduce((acc, loaded) => {
      acc += (+loaded * 100) / allLoadStates.length;
      return acc;
    }, 0);
  });

  const isLoaded = computed(() => {
    return loadPercentage.value === 100;
  });

  const loadAll = () => {
    Promise.all([elementaryStore.load()]);
  };

  return {
    loadPercentage,
    isLoaded,
    loadAll,
  };
});
