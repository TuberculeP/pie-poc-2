<script setup lang="ts">
import { computed } from "vue";
import type { Track, OscillatorType } from "../../../lib/utils/types";
import { useTimelineStore } from "../../../stores/timelineStore";
import { useTrackAudioStore } from "../../../stores/trackAudioStore";
import { SOUNDFONT_LIST } from "../../../lib/audio/engines";
import TrackEqualizer from "./TrackEqualizer.vue";

const props = defineProps<{
  track: Track;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const timelineStore = useTimelineStore();
const trackAudioStore = useTrackAudioStore();

const instrumentType = computed(() => props.track.instrument.type);

const oscillatorTypes: OscillatorType[] = [
  "sine",
  "square",
  "sawtooth",
  "triangle",
];

const handleOscillatorChange = (type: OscillatorType) => {
  timelineStore.updateTrackInstrument(props.track.id, { oscillatorType: type });
  trackAudioStore.updateTrackInstrument(props.track.id, {
    oscillatorType: type,
  });
};

const handleSoundfontChange = (soundfont: string) => {
  timelineStore.updateTrackInstrument(props.track.id, { soundfont });
  trackAudioStore.updateTrackInstrument(props.track.id, { soundfont });
};

const handleVolumeChange = (volume: number) => {
  timelineStore.setTrackVolume(props.track.id, volume);
};

const handleReverbChange = (reverb: number) => {
  timelineStore.setTrackReverb(props.track.id, reverb);
};

const handleEQBandUpdate = (bandId: string, gain: number) => {
  timelineStore.updateTrackEQBand(props.track.id, bandId, gain);
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="visible" class="settings-overlay" @click.self="handleClose">
        <div class="settings-panel">
          <div class="panel-header">
            <h3>{{ track.name }}</h3>
            <button class="close-btn" @click="handleClose">×</button>
          </div>

          <div class="panel-body">
            <div class="setting-group">
              <label class="setting-label">Volume</label>
              <div class="slider-control">
                <input
                  type="range"
                  :value="track.volume"
                  min="0"
                  max="100"
                  @input="
                    handleVolumeChange(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
                <span class="slider-value">{{ track.volume }}%</span>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Reverb</label>
              <div class="slider-control">
                <input
                  type="range"
                  :value="track.reverb ?? 0"
                  min="0"
                  max="100"
                  @input="
                    handleReverbChange(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
                <span class="slider-value">{{ track.reverb ?? 0 }}%</span>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Égaliseur</label>
              <TrackEqualizer
                v-if="track.eqBands"
                :bands="track.eqBands"
                @update="handleEQBandUpdate"
              />
            </div>

            <template v-if="instrumentType === 'basicSynth'">
              <div class="setting-group">
                <label class="setting-label">Forme d'onde</label>
                <div class="waveform-selector">
                  <button
                    v-for="waveform in oscillatorTypes"
                    :key="waveform"
                    class="waveform-btn"
                    :class="{
                      active: track.instrument.oscillatorType === waveform,
                    }"
                    @click="handleOscillatorChange(waveform)"
                  >
                    {{ waveform }}
                  </button>
                </div>
              </div>
            </template>

            <template v-else-if="instrumentType === 'smplr'">
              <div class="setting-group">
                <label class="setting-label">Instrument</label>
                <select
                  class="soundfont-select"
                  :value="track.instrument.soundfont"
                  @change="
                    handleSoundfontChange(
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option v-for="sf in SOUNDFONT_LIST" :key="sf" :value="sf">
                    {{ sf.replace(/_/g, " ") }}
                  </option>
                </select>
              </div>
            </template>

            <template v-else-if="instrumentType === 'elementarySynth'">
              <div class="setting-group">
                <p class="coming-soon">Paramètres ADSR à venir...</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 900;
}

.settings-panel {
  width: 320px;
  height: 100%;
  background: #2d0f20;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(122, 15, 62, 0.5);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #f2efe8;
  }
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;

  &:hover {
    background: #7a0f3e;
    color: #f2efe8;
  }
}

.panel-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 12px;

  input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    background: #7a0f3e;
    border-radius: 3px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: #ff3fb4;
      border-radius: 50%;
      cursor: pointer;
    }
  }

  .slider-value {
    font-size: 13px;
    color: #f2efe8;
    min-width: 45px;
    text-align: right;
  }
}

.waveform-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.waveform-btn {
  padding: 10px;
  border: 1px solid rgba(122, 15, 62, 0.5);
  border-radius: 6px;
  background: #1a0e15;
  color: #f2efe8;
  font-size: 13px;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #3d1528;
    border-color: rgba(122, 15, 62, 0.7);
  }

  &.active {
    background: #ff3fb4;
    border-color: #ff3fb4;
    color: #1a0e15;
  }
}

.soundfont-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(122, 15, 62, 0.5);
  border-radius: 6px;
  background: #1a0e15;
  color: #f2efe8;
  font-size: 13px;
  cursor: pointer;
  color-scheme: dark;

  &:focus {
    outline: none;
    border-color: #ff3fb4;
  }

  option {
    background: #2d0f20;
    text-transform: capitalize;
  }
}

.coming-soon {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  .settings-panel {
    transform: translateX(100%);
  }
}
</style>
