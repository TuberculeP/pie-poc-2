import { defineStore } from "pinia";
import { ref, markRaw } from "vue";
import type { AudioSample, SamplePack, SampleFolder } from "../lib/utils/types";
import { useAudioBusStore } from "./audioBusStore";

type LoadingState = "idle" | "loading" | "ready" | "error";

interface ManifestSample {
  id: string;
  name: string;
  filename: string;
}

interface ManifestFolder {
  name: string;
  samples: ManifestSample[];
}

interface ManifestPack {
  id: string;
  name: string;
  author?: string;
  featured?: boolean;
  cover?: string;
  folders: ManifestFolder[];
}

interface SampleManifest {
  packs: ManifestPack[];
}

export const useAudioLibraryStore = defineStore("audioLibrary", () => {
  const audioBusStore = useAudioBusStore();

  const packs = ref<SamplePack[]>([]);
  const samples = ref<Map<string, AudioSample>>(new Map());
  const buffers = ref<Map<string, AudioBuffer>>(new Map());
  const loadingStates = ref<Map<string, LoadingState>>(new Map());
  const isInitialized = ref(false);

  const getSample = (sampleId: string): AudioSample | undefined => {
    return samples.value.get(sampleId);
  };

  const getSampleBuffer = (sampleId: string): AudioBuffer | undefined => {
    return buffers.value.get(sampleId);
  };

  const getLoadingState = (sampleId: string): LoadingState => {
    return loadingStates.value.get(sampleId) ?? "idle";
  };

  const getPack = (packId: string): SamplePack | undefined => {
    return packs.value.find((p) => p.id === packId);
  };

  const getAllPacks = (): SamplePack[] => {
    return packs.value;
  };

  const getFeaturedPacks = (): SamplePack[] => {
    return packs.value.filter((p) => p.featured);
  };

  const getAllSamples = (): AudioSample[] => {
    return Array.from(samples.value.values());
  };

  const generateWaveformData = (buffer: AudioBuffer, points: number = 128): number[] => {
    const channelData = buffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / points);
    const waveform: number[] = [];

    for (let i = 0; i < points; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] ?? 0);
      }
      waveform.push(sum / blockSize);
    }

    const max = Math.max(...waveform, 0.001);
    return waveform.map((v) => v / max);
  };

  const loadSample = async (sampleId: string): Promise<AudioBuffer | null> => {
    const sample = samples.value.get(sampleId);
    if (!sample) {
      console.warn(`Sample not found: ${sampleId}`);
      return null;
    }

    if (buffers.value.has(sampleId)) {
      return buffers.value.get(sampleId)!;
    }

    if (loadingStates.value.get(sampleId) === "loading") {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const state = loadingStates.value.get(sampleId);
          if (state === "ready") {
            clearInterval(checkInterval);
            resolve(buffers.value.get(sampleId) ?? null);
          } else if (state === "error") {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 50);
      });
    }

    loadingStates.value.set(sampleId, "loading");

    try {
      const response = await fetch(`/samples/packs/${sample.packId}/${sample.filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioBusStore.audioContext.decodeAudioData(
        arrayBuffer,
      );

      buffers.value.set(sampleId, markRaw(audioBuffer));

      sample.duration = audioBuffer.duration;
      sample.waveformData = generateWaveformData(audioBuffer);

      loadingStates.value.set(sampleId, "ready");
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sample ${sampleId}:`, error);
      loadingStates.value.set(sampleId, "error");
      return null;
    }
  };

  const preloadPack = async (packId: string): Promise<void> => {
    const pack = getPack(packId);
    if (!pack) return;

    const allSamples: AudioSample[] = [];
    for (const folder of pack.folders) {
      allSamples.push(...folder.samples);
    }
    await Promise.all(allSamples.map((s) => loadSample(s.id)));
  };

  const preloadAllSamples = async (): Promise<void> => {
    const allSamples = getAllSamples();
    await Promise.all(allSamples.map((s) => loadSample(s.id)));
  };

  const initialize = async (): Promise<void> => {
    if (isInitialized.value) return;

    try {
      const response = await fetch("/samples/manifest.json");
      if (!response.ok) {
        console.warn("No audio library manifest found");
        isInitialized.value = true;
        return;
      }

      const manifest: SampleManifest = await response.json();

      for (const packData of manifest.packs) {
        const folders: SampleFolder[] = [];

        for (const folderData of packData.folders) {
          const folderSamples: AudioSample[] = [];

          for (const sampleData of folderData.samples) {
            const sample: AudioSample = {
              id: sampleData.id,
              name: sampleData.name,
              packId: packData.id,
              folder: folderData.name,
              filename: sampleData.filename,
              duration: 0,
            };
            samples.value.set(sampleData.id, sample);
            loadingStates.value.set(sampleData.id, "idle");
            folderSamples.push(sample);
          }

          folders.push({
            name: folderData.name,
            samples: folderSamples,
          });
        }

        packs.value.push({
          id: packData.id,
          name: packData.name,
          author: packData.author,
          featured: packData.featured,
          cover: packData.cover,
          folders,
        });
      }

      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to initialize audio library:", error);
      isInitialized.value = true;
    }
  };

  return {
    packs,
    samples,
    isInitialized,
    getSample,
    getSampleBuffer,
    getLoadingState,
    getPack,
    getAllPacks,
    getFeaturedPacks,
    getAllSamples,
    loadSample,
    preloadPack,
    preloadAllSamples,
    initialize,
  };
});
