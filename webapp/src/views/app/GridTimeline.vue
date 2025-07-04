<template>
  <div class="container">
    <!-- Réglage facultatif de la grille -->
    <GridSettings
      v-model:stepWidth="stepWidth"
      v-model:rowHeight="rowHeight"
    />

    <!-- Bouton pour ajouter un nouveau pattern -->
    <div class="controls">
      <button @click="addPattern">+ Ajouter un pattern</button>
    </div>

    <!-- Timeline, avec un spacer pour aligner sous la sidebar -->
		<div class="timeline" ref="tl" @scroll="sync('h')">
			<div class="sidebar-spacer"></div>
			<TimelineRuler :steps="colNum" :stepWidth="stepWidth" />
		</div>

    <div class="main">
      <!-- Sidebar des pistes -->
      <div class="sidebar" ref="sb" @scroll="sync('v')">
        <PianoKeySidebar :keys="pianoKeys" :rowHeight="rowHeight" />
      </div>

      <!-- Zone de la grille scrollable -->
      <div class="grid-area" ref="ga" @scroll="sync()">
        <PianoRollGrid
				v-model:layout="patterns"
				:colNum="colNum"
				:rowHeight="rowHeight"
				class="grid-wrapper"
				:style="{
					'--step-width'   : stepWidth + 'px',
					'--row-height'   : rowHeight + 'px',
					'--subdivisions' : subdivisions
				}"
          @drag="onPatternDrag"
          @resize="onPatternResize"
        >
          <template #item="{ item }">
            <!-- NoteItem affiche ici le nom du pattern -->
            <NoteItem :note="{ pitch: item.label }" />
          </template>
        </PianoRollGrid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import GridSettings from '../../components/app/timeline/GridSettings.vue'
import TimelineRuler from '../../components/app/timeline/TimelineRuler.vue'
import PianoKeySidebar from '../../components/app/timeline/PianoKeySidebar.vue'
import PianoRollGrid from '../../components/app/timeline/PianoRollGrid.vue'
import NoteItem from '../../components/app/timeline/NoteItem.vue'

/* --- paramètres de la grille --- */
const stepWidth = ref(80)         // largeur d’1 mesure en px
const rowHeight = ref(40)         // hauteur d’1 piste en px
const measures     = 4             // 4 mesures
const subdivisions = 4             // 4 subdivisions par mesure (TODO PLUS TARD : varie en fonction du zoom et dézoom)
const colNum       = measures * subdivisions

/* --- génération de 8 pistes exemple --- */
const pianoKeys = Array.from({ length: 8 }, (_, i) => `Track ${i+1}`)

/* --- liste des patterns (layout pour GridLayout) --- */
let nextId = 1
const patterns = reactive<Array<{
  i:    string
  x:    number
  y:    number
  w:    number
  h:    number
  label:string
}>>([])

/* --- refs pour la synchro du scroll --- */
const tl = ref<HTMLElement>()
const sb = ref<HTMLElement>()
const ga = ref<HTMLElement>()



/* --- fonctions de sync scroll --- */
function sync(dir?: 'h'|'v') {
  if (!tl.value || !sb.value || !ga.value) return
  if (dir !== 'v') tl.value.scrollLeft = ga.value.scrollLeft
  if (dir !== 'h') sb.value.scrollTop  = ga.value.scrollTop
}

/* --- ajout d’un nouveau pattern --- */
function addPattern() {
  patterns.push({
    i:     `pattern-${nextId}`,
    x:     0,
    y:     0,
    w:     1,     // 1 mesure par défaut
    h:     1,     // 1 piste de haut
    label: `Pattern ${nextId}`
  })
  nextId++
}

/* --- handlers pour mise à jour du layout après drag/resize --- */
function onPatternDrag(item: any) {
  // ici item.x et item.y sont mis à jour automatiquement dans 'patterns'
}
function onPatternResize(item: any, newW: number) {
  item.w = newW
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1f2a33;
}
.controls {
  padding: 0.5rem;
  background: #2a2a2a;
}
.controls button {
  padding: 0.4rem 0.8rem;
  background: #4caf50;
  border: none;
  border-radius: 3px;
  color: #fff;
  cursor: pointer;
}
.timeline {
  display: flex;
  position: relative;
  height: 30px;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid #3f4a52;
  background: #2d3b45;
}
.sidebar-spacer {
  flex: 0 0 100px;
}
.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  width: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #3f4a52;
}
.grid-area {
  flex: 1;
  overflow: auto;
}

.grid-wrapper {
  background-color: #2d3b45;
  background-image:
    linear-gradient(to bottom, #3f4a52 1px, transparent 1px),
    linear-gradient(to right, #3f4a52 1px, transparent 1px),
    linear-gradient(to right, #3f4a52 2px, transparent 2px);
  background-size:
    100% var(--row-height),
    var(--step-width) 100%,
    calc(var(--step-width) * var(--subdivisions)) 100%;
  position: relative;
}
</style>
