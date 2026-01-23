import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useSequencerStore } from "./sequencerStore";
import { createImpulseResponse, createEQFilter } from "../lib/audio/config";

export const useAudioBusStore = defineStore("audioBusStore", () => {
  const sequencerStore = useSequencerStore();

  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const inputBus = audioContext.createGain();
  const masterGain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const reverbBoost = audioContext.createGain();
  const convolver = audioContext.createConvolver();

  inputBus.gain.value = 1;
  masterGain.gain.value = 1;
  dryGain.gain.value = 1;
  wetGain.gain.value = 0;
  reverbBoost.gain.value = 1.5;
  convolver.buffer = createImpulseResponse(audioContext);

  const eqFilters = new Map<string, BiquadFilterNode>();
  const filters = sequencerStore.eqBands.map((band) => {
    const filter = createEQFilter(audioContext, band);
    eqFilters.set(band.id, filter);
    return filter;
  });

  // Chaîne : inputBus → filters → masterGain → [dry + wet] → destination
  inputBus.connect(filters[0]);
  filters.reduce((prev, curr) => (prev.connect(curr), curr));
  filters[filters.length - 1].connect(masterGain);

  masterGain.connect(dryGain).connect(audioContext.destination);
  masterGain
    .connect(convolver)
    .connect(reverbBoost)
    .connect(wetGain)
    .connect(audioContext.destination);

  const isInitialized = ref(true);

  const setGain = (node: GainNode, value: number) => {
    const v = value === 0 ? 0.001 : value;
    node.gain.exponentialRampToValueAtTime(v, audioContext.currentTime + 0.05);
  };

  watch(
    () => sequencerStore.volume,
    (v) => setGain(masterGain, v / 100),
    { immediate: true },
  );
  watch(
    () => sequencerStore.reverb,
    (v) => setGain(wetGain, v / 100),
    { immediate: true },
  );
  watch(
    () => sequencerStore.eqBands,
    (bands) =>
      bands.forEach((b) => {
        const f = eqFilters.get(b.id);
        if (f && Number.isFinite(b.gain))
          f.gain.setValueAtTime(b.gain, audioContext.currentTime);
      }),
    { immediate: true, deep: true },
  );

  const ensureAudioContextResumed = async () => {
    if (audioContext.state === "suspended") await audioContext.resume();
  };

  return { audioContext, inputBus, isInitialized, ensureAudioContextResumed };
});
