import WebRenderer from "@elemaudio/web-renderer";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useElementaryStore = defineStore("elementaryStore", () => {
  const isLoaded = ref(false);

  // Audio related objects cannot be serialized and cannot be set in ref
  // We need to access them via get functions in components
  let ctx: AudioContext;
  let core: WebRenderer;
  const getCtx = () => ctx;
  const getCore = () => core;

  const load = async () => {
    ctx = new AudioContext();
    core = new WebRenderer();
    // Load elementary node
    const node = await core.initialize(ctx, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    node.connect(ctx.destination);

    isLoaded.value = true;
  };

  return {
    isLoaded,
    getCtx,
    getCore,
    load,
  };
});
