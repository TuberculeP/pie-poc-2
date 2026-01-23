<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { ref, computed } from "vue";
import { Soundfont, Reverb } from "smplr";
import { watch } from "vue";
import { useMIDIStore } from "../../../stores/MIDIStore";
import { useSequencerStore } from "../../../stores/sequencerStore";

const currentNotes = ref<{ note: string; stopFn: () => void; id: number }[]>(
  [],
);

// Stores pour accéder aux événements MIDI et au volume global
const midiStore = useMIDIStore();
const sequencerStore = useSequencerStore();

// Fonctions de cleanup pour désenregistrer les callbacks
let unregisterNoteOn: (() => void) | null = null;
let unregisterNoteOff: (() => void) | null = null;

const soundfontList = [
  "accordion",
  "acoustic_bass",
  "acoustic_grand_piano",
  "acoustic_guitar_nylon",
  "acoustic_guitar_steel",
  "agogo",
  "alto_sax",
  "applause",
  "bag_pipe",
  "banjo",
  "baritone_sax",
  "bassoon",
  "bird_tweet",
  "blown_bottle",
  "brass_section",
  "breath_noise",
  "bright_acoustic_piano",
  "celesta",
  "cello",
  "choir_aahs",
  "church_organ",
  "clarinet",
  "clavichord",
  "contrabass",
  "distortion_guitar",
  "drawbar_organ",
  "dulcimer",
  "electric_bass_finger",
  "electric_bass_pick",
  "electric_grand_piano",
  "electric_guitar_clean",
  "electric_guitar_jazz",
  "electric_guitar_muted",
  "electric_piano_1",
  "electric_piano_2",
  "english_horn",
  "fiddle",
  "flute",
  "french_horn",
  "fretless_bass",
  "fx_1_rain",
  "fx_2_soundtrack",
  "fx_3_crystal",
  "fx_4_atmosphere",
  "fx_5_brightness",
  "fx_6_goblins",
  "fx_7_echoes",
  "fx_8_scifi",
  "glockenspiel",
  "guitar_fret_noise",
  "guitar_harmonics",
  "gunshot",
  "harmonica",
  "harpsichord",
  "helicopter",
  "honkytonk_piano",
  "kalimba",
  "koto",
  "lead_1_square",
  "lead_2_sawtooth",
  "lead_3_calliope",
  "lead_4_chiff",
  "lead_5_charang",
  "lead_6_voice",
  "lead_7_fifths",
  "lead_8_bass_lead",
  "marimba",
  "melodic_tom",
  "music_box",
  "muted_trumpet",
  "oboe",
  "ocarina",
  "orchestra_hit",
  "orchestral_harp",
  "overdriven_guitar",
  "pad_1_new_age",
  "pad_2_warm",
  "pad_3_polysynth",
  "pad_4_choir",
  "pad_5_bowed",
  "pad_6_metallic",
  "pad_7_halo",
  "pad_8_sweep",
  "pan_flute",
  "percussive_organ",
  "piccolo",
  "pizzicato_strings",
  "recorder",
  "reed_organ",
  "reverse_cymbal",
  "rock_organ",
  "seashore",
  "shakuhachi",
  "shamisen",
  "shanai",
  "sitar",
  "slap_bass_1",
  "slap_bass_2",
  "soprano_sax",
  "steel_drums",
  "string_ensemble_1",
  "string_ensemble_2",
  "synth_bass_1",
  "synth_bass_2",
  "synth_drum",
  "synth_voice",
  "synthbrass_1",
  "synthbrass_2",
  "synthstrings_1",
  "synthstrings_2",
  "taiko_drum",
  "tango_accordion",
  "telephone_ring",
  "tenor_sax",
  "timpani",
  "tinkle_bell",
  "tremolo_strings",
  "trombone",
  "trumpet",
  "tuba",
  "tubular_bells",
  "vibraphone",
  "viola",
  "violin",
  "voice_oohs",
  "whistle",
  "woodblock",
  "xylophone",
];

const selectedSoundfont = ref("marimba");

// Créer un AudioContext partagé avec gain node
const audioContext = new AudioContext();
const masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);
masterGainNode.gain.value = 1;

// Créer la reverb et attendre qu'elle soit chargée
const reverb = new Reverb(audioContext);
let reverbReady = false;
let reverbAddedToSoundfont = false; // Flag pour savoir si addEffect a réussi

// Attendre 1200ms pour que la Reverb se charge
setTimeout(() => {
  reverbReady = true;
}, 1200);

// Écouter les changements du volume global
watch(
  () => sequencerStore.volume,
  (newVolume) => {
    const normalizedVolume = newVolume / 100;
    if (normalizedVolume === 0) {
      masterGainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    } else {
      masterGainNode.gain.exponentialRampToValueAtTime(
        normalizedVolume,
        audioContext.currentTime + 0.05,
      );
    }
  },
);

const soundfont = computed(
  () =>
    new Soundfont(audioContext, {
      instrument: selectedSoundfont.value,
    }),
);

// Écouter les changements d'instrument
watch(
  () => selectedSoundfont.value,
  () => {
    reverbAddedToSoundfont = false;

    setTimeout(() => {
      if (soundfont.value && soundfont.value.output && reverbReady) {
        try {
          soundfont.value.output.addEffect("reverb", reverb, 0);
          reverbAddedToSoundfont = true;

          const normalizedReverb = sequencerStore.reverb / 100;
          soundfont.value.output.sendEffect("reverb", normalizedReverb);
        } catch (e) {
          console.error("Erreur lors de l'ajout de la reverb:", e);
        }
      }
    }, 50);
  },
);

// Écouter les changements de reverb et mettre à jour l'effet
watch(
  () => sequencerStore.reverb,
  (newReverb) => {
    if (!reverbAddedToSoundfont) return;

    const normalizedReverb = newReverb / 100;
    try {
      if (soundfont.value && soundfont.value.output) {
        soundfont.value.output.sendEffect("reverb", normalizedReverb);
      }
    } catch (error) {
      console.error("Erreur reverb:", error);
    }
  },
  { immediate: true },
);

onMounted(() => {
  // Ajouter la reverb à la soundfont au démarrage
  const addReverbWithPolling = () => {
    const startTime = Date.now();
    const timeoutMs = 5000;
    const pollIntervalMs = 100;

    const pollInterval = setInterval(() => {
      if (soundfont.value && soundfont.value.output && reverbReady) {
        clearInterval(pollInterval);
        try {
          soundfont.value.output.addEffect("reverb", reverb, 0);
          reverbAddedToSoundfont = true;

          const normalizedReverb = sequencerStore.reverb / 100;
          soundfont.value.output.sendEffect("reverb", normalizedReverb);
        } catch (e) {
          console.error("Erreur lors de l'ajout de la reverb:", e);
        }
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(pollInterval);
        console.warn("Timeout: reverb n'a pas pu être ajoutée");
      }
    }, pollIntervalMs);
  };

  addReverbWithPolling();

  // S'abonner aux événements de notes du MIDIStore (clavier + séquenceur)
  unregisterNoteOn = midiStore.onNotePlayed((note, _key) => {
    // Convertir la note en format MIDI (ex: "C4" → "C4")
    const midiNote = note.scale; // note.scale contient "C4", "D4", etc.
    const stopFn = soundfont.value.start({ note: midiNote });

    // Ajouter un ID unique pour différencier les instances multiples de la même note
    const noteInstance = {
      note: midiNote,
      stopFn,
      id: Date.now() + Math.random(), // ID unique pour chaque instance
    };

    currentNotes.value.push(noteInstance);
  });

  unregisterNoteOff = midiStore.onNoteStopped((note, _key) => {
    const midiNote = note.scale;

    // Trouver la première instance de cette note (FIFO - First In, First Out)
    const noteIndex = currentNotes.value.findIndex((n) => n.note === midiNote);

    if (noteIndex !== -1) {
      const noteToRemove = currentNotes.value[noteIndex];
      noteToRemove.stopFn();
      currentNotes.value.splice(noteIndex, 1);
    }
  });
});

onBeforeUnmount(() => {
  // Nettoyer les callbacks pour éviter les fuites mémoire
  if (unregisterNoteOn) {
    unregisterNoteOn();
  }
  if (unregisterNoteOff) {
    unregisterNoteOff();
  }
});
</script>

<template>
  <p>Sampler</p>
  <select v-model="selectedSoundfont">
    <option v-for="item in soundfontList" :value="item" :key="item">
      {{ item }}
    </option>
  </select>
</template>

<style scoped>
div {
  display: flex;
}
</style>
