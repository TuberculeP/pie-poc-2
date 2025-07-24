<template>
  <div class="app">
    <!-- Header avec contrôles -->
    <header class="header">
      <div class="header__left">
        <h1 class="header__title">DAW Studio MVP</h1>
        <div class="header__playback">
          <button @click="handlePlay" class="btn btn--play">
            <component :is="isPlaying ? Pause : Play" :size="20" />
          </button>
          <button @click="handleStop" class="btn btn--stop">
            <Square :size="20" />
          </button>
        </div>
      </div>

      <div class="header__right">
        <div class="bpm-control">
          <label for="bpm">BPM :</label>
          <input id="bpm" type="number" v-model.number="bpm" min="60" max="200" />
        </div>
        <div class="position-display">
          Position : {{ currentPosition.toFixed(1) }}
        </div>
      </div>
    </header>

    <div class="main">
      <!-- Panel des pistes -->
      <aside class="tracks-panel">
        <h2 class="tracks-panel__title">Tracks</h2>
        <div
          v-for="track in tracks"
          :key="track.id"
          class="track-item"
          :class="{ 'track-item--inactive': !track.active }"
        >
          <div class="track-item__header">
            <div class="track-item__info">
              <span
                class="track-item__color"
                :style="{ backgroundColor: track.color }"
              ></span>
              <span class="track-item__name">{{ track.name }}</span>
            </div>
            <button
              @click="toggleTrackActive(track.id)"
              class="btn btn--toggle"
              :class="{ 'btn--active': track.active }"
            >
              <span v-if="track.active" class="btn--indicator"></span>
            </button>
          </div>

          <div class="track-item__controls">
            <button
              @click="toggleTrackMute(track.id)"
              class="btn btn--mute"
              :class="{ 'btn--muted': track.muted }"
            >
              <component :is="track.muted ? VolumeX : Volume2" size="12" />
            </button>
            <button
              @click="toggleTrackSolo(track.id)"
              class="btn btn--solo"
              :class="{ 'btn--soloed': track.solo }"
            >
              S
            </button>
          </div>
        </div>
      </aside>

      <!-- Timeline principale -->
      <section class="timeline-container">
        <!-- Ruler avec mesures -->
        <div class="ruler" :style="{ minWidth: `${bars.length * 200}px` }">
          <div
            v-for="bar in bars"
            :key="bar"
            class="bar"
          >
            <div class="bar__number">{{ bar }}</div>
            <div class="bar__beats">
              <div
                v-for="beat in beatsPerBar"
                :key="beat"
                class="beat"
              >{{ beat }}</div>
            </div>
          </div>
        </div>

        <!-- Curseur de lecture -->
        <div
          class="playhead"
          :style="{
            left: `${(currentPosition / beatsPerBar) * 200}px`,
            height: `${80 + tracks.length * 80}px`
          }"
        ></div>

        <!-- Grille des pistes -->
        <div class="track-grid" :style="{ minWidth: `${bars.length * 200}px` }">
          <div
            v-for="track in tracks"
            :key="track.id"
            class="track-row"
            :class="{ 'track-row--inactive': !track.active }"
          >
            <!-- Grille de fond -->
            <div class="background-grid">
              <div
                v-for="bar in bars"
                :key="bar"
                class="bg-bar"
              >
                <div
                  v-for="beat in beatsPerBar"
                  :key="beat"
                  class="bg-beat"
                  :style="{
                    left: `${((beat - 1) / beatsPerBar) * 100}%`,
                    width: `${100 / beatsPerBar}%`
                  }"
                ></div>
              </div>
            </div>

            <!-- Clips audio -->
            <div
              v-for="clip in getTrackClips(track.id)"
              :key="clip.id"
              class="clip"
              :style="{
                left: `${(clip.start / beatsPerBar) * 200}px`,
                width: `${(clip.length / beatsPerBar) * 200}px`,
                backgroundColor: track.color,
                borderColor: track.color
              }"
            >
              <div class="clip__content">
                <span class="clip__name">{{ clip.name }}</span>
              </div>
              <div class="resize-handle resize-handle--left"></div>
              <div class="resize-handle resize-handle--right"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-vue-next'

const isPlaying = ref(false)
const currentPosition = ref(0)
const bpm = ref(120)
const tracks = ref([
  { id: 1, name: 'Track 1', muted: false, solo: false, active: true, color: '#ff6b6b' },
  { id: 2, name: 'Track 2', muted: false, solo: false, active: true, color: '#4ecdc4' },
  { id: 3, name: 'Track 3', muted: false, solo: false, active: true, color: '#45b7d1' },
  { id: 4, name: 'Track 4', muted: false, solo: false, active: false, color: '#96ceb4' },
  { id: 5, name: 'Track 5', muted: false, solo: false, active: false, color: '#feca57' },
  { id: 6, name: 'Track 6', muted: false, solo: false, active: true, color: '#ff9ff3' },
  { id: 7, name: 'Track 7', muted: false, solo: false, active: false, color: '#54a0ff' },
  { id: 8, name: 'Track 8', muted: false, solo: false, active: true, color: '#5f27cd' },
])
const clips = ref([
  { id: 1, trackId: 1, start: 0, length: 4, name: 'Clip 1' },
  { id: 2, trackId: 2, start: 4, length: 8, name: 'Clip 2' },
  { id: 3, trackId: 3, start: 2, length: 6, name: 'Clip 3' },
  { id: 4, trackId: 6, start: 8, length: 4, name: 'Clip 4' },
  { id: 5, trackId: 8, start: 1, length: 3, name: 'Clip 5' },
])

const bars = computed(() => Array.from({ length: 32 }, (_, i) => i + 1))
const beatsPerBar = 4
const totalBeats = computed(() => bars.value.length * beatsPerBar)

let intervalId = null

watch([isPlaying, bpm], ([playing]) => {
  if (intervalId) clearInterval(intervalId)
  if (playing) {
    const intervalMs = (60 / bpm.value / 4) * 1000
    intervalId = setInterval(() => {
      currentPosition.value = (currentPosition.value + (60 / bpm.value / 4)) % totalBeats.value
    }, intervalMs)
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

function handlePlay() {
  isPlaying.value = !isPlaying.value
}
function handleStop() {
  isPlaying.value = false
  currentPosition.value = 0
}
function toggleTrackMute(id) {
  tracks.value = tracks.value.map(t => t.id === id ? { ...t, muted: !t.muted } : t)
}
function toggleTrackSolo(id) {
  tracks.value = tracks.value.map(t => t.id === id ? { ...t, solo: !t.solo } : t)
}
function toggleTrackActive(id) {
  tracks.value = tracks.value.map(t => t.id === id ? { ...t, active: !t.active } : t)
}
function getTrackClips(trackId) {
  return clips.value.filter(c => c.trackId === trackId)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #1f2937;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  padding: 16px;
  display: flex;
  justify-content: space-between;
}

.header__left,
.header__right {
  display: flex;
  align-items: center;
}

.header__title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-right: 16px;
}

.header__playback {
  display: flex;
  gap: 8px;
}

.btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn--play {
  background: #16a34a;
}
.btn--play:hover {
  background: #15803d;
}

.btn--stop {
  background: #dc2626;
}
.btn--stop:hover {
  background: #b91c1c;
}

.header__right {
  gap: 24px;
}

.bpm-control label {
  margin-right: 4px;
}
.bpm-control input {
  width: 64px;
  padding: 4px 8px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 4px;
  color: #fff;
  text-align: center;
}

.position-display {
  font-size: 0.875rem;
}

.main {
  flex: 1;
  display: flex;
  height: calc(100vh - 72px);
}

.tracks-panel {
  width: 256px;
  background: #2d3748;
  border-right: 1px solid #4a5568;
  overflow-y: auto;
  padding: 16px;
}

.tracks-panel__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.track-item {
  background: #4a5568;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 12px;
}
.track-item--inactive {
  opacity: 0.5;
}

.track-item__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.track-item__info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-item__color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.track-item__name {
  font-size: 0.875rem;
  font-weight: 500;
}

.btn--toggle {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #4b5563;
}
.btn--toggle.btn--active {
  background: #16a34a;
}
.btn--toggle:hover {
  background: #4a5563;
}
.btn--toggle.btn--active:hover {
  background: #15803d;
}

.btn--indicator {
  display: block;
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  margin: 4px auto 0;
}

.track-item__controls {
  display: flex;
  gap: 8px;
}

.btn--mute,
.btn--solo {
  flex: 1;
  padding: 4px 0;
  font-size: 0.75rem;
  border-radius: 4px;
  background: #4b5563;
}
.btn--mute.btn--muted {
  background: #dc2626;
}
.btn--mute:hover {
  background: #374151;
}
.btn--mute.btn--muted:hover {
  background: #b91c1c;
}

.btn--solo.btn--soloed {
  background: #d97706;
}
.btn--solo:hover {
  background: #374151;
}
.btn--solo.btn--soloed:hover {
  background: #b45309;
}

.timeline-container {
  flex: 1;
  overflow: auto;
  position: relative;
}

.ruler {
  position: sticky;
  top: 0;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  z-index: 10;
  display: flex;
}

.bar {
  position: relative;
  border-right: 1px solid #4a5568;
  width: 200px;
}
.bar__number {
  text-align: center;
  padding: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}
.bar__beats {
  display: flex;
}
.beat {
  flex: 1;
  border-right: 1px solid #4a5568;
  text-align: center;
  font-size: 0.75rem;
  padding: 4px 0;
}

.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  background: #fbbf24;
  z-index: 20;
  transition: left 0.075s linear;
}

.track-grid {
  position: relative;
  display: block;
}

.track-row {
  height: 80px;
  border-bottom: 1px solid #4a5568;
  position: relative;
}
.track-row--inactive {
  opacity: 0.5;
}

.background-grid {
  position: absolute;
  inset: 0;
  display: flex;
}
.bg-bar {
  position: relative;
  border-right: 1px solid #4a5568;
  width: 200px;
  height: 100%;
}
.bg-beat {
  position: absolute;
  border-right: 1px solid #4a5568;
  height: 100%;
}

.clip {
  position: absolute;
  height: 64px;
  margin-top: 8px;
  border-radius: 8px;
  cursor: move;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  border: 2px solid;
  transition: border-color 0.2s;
}
.clip:hover {
  border-opacity: 1;
}

.clip__content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
}
.clip__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resize-handle {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: rgba(0,0,0,0.3);
  cursor: ew-resize;
}
.resize-handle--left {
  left: 0;
}
.resize-handle--right {
  right: 0;
}
</style>
