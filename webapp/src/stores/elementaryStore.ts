import WebRenderer from "@elemaudio/web-renderer";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAudioBusStore } from "./audioBusStore";

export const useElementaryStore = defineStore("elementaryStore", () => {
  const isLoaded = ref(false);

  let core: WebRenderer;
  const getCore = () => core;

  const load = async () => {
    const audioBusStore = useAudioBusStore();
    const { audioContext, inputBus } = audioBusStore;

    core = new WebRenderer();
    const node = await core.initialize(audioContext, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(inputBus);

    isLoaded.value = true;
  };

  return {
    isLoaded,
    getCore,
    load,
  };
});
