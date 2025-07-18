<script setup lang="ts">
import { onMounted } from "vue";
import { WebMidi } from "webmidi";
import { ref, computed } from "vue";
import { Soundfont } from "smplr";
import { watch } from "vue";

const currentNotes = ref<{ note: string; stopFn: () => void }[]>([]);

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
const soundfont = computed(
  () =>
    new Soundfont(new AudioContext(), {
      instrument: selectedSoundfont.value,
    }),
);

watch(soundfont, (_, old) => {
  old.disconnect();
  currentNotes.value = [];
});

onMounted(async () => {
  await WebMidi.enable();

  const selectedInput = WebMidi.inputs[0];
  selectedInput.addListener("noteon", (e) => {
    const midiNote = e.note.identifier;
    const stopFn = soundfont.value.start({ note: midiNote });
    currentNotes.value.push({
      note: midiNote,
      stopFn,
    });
  });

  selectedInput.addListener("noteoff", (e) => {
    const midiNote = e.note.identifier;
    const noteToRemove = currentNotes.value.find(
      ({ note }) => note === midiNote,
    );
    noteToRemove?.stopFn();
    currentNotes.value = currentNotes.value.filter(
      (n) => n.note !== noteToRemove?.note,
    );
  });
});
</script>

<template>
  <p>Smplr</p>
  <select v-model="selectedSoundfont">
    <option v-for="item in soundfontList" :value="item" :key="item">
      {{ item }}
    </option>
  </select>
  <pre>{{ currentNotes }}</pre>
</template>

<style scoped>
div {
  display: flex;
}
</style>
