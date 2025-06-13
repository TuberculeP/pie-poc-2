<script setup lang="ts">
import { onMounted } from "vue";
import { useElementaryStore } from "../../../stores/elementaryStore";
import { el } from "@elemaudio/core";
import { WebMidi } from "webmidi";
import { ref } from "vue";
import { watch } from "vue";
import { reactive } from "vue";
import { computed } from "vue";
import BloopPotard from "../BloopPotard.vue";

const elementaryStore = useElementaryStore();

type Voice = {
  gate: number;
  key: string;
  freq: number;
};

const adsr = reactive({
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 5,
});

function computeFrequency(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

const voices = ref<Voice[]>(new Array<Voice>());

const computedVoices = computed(() =>
  voices.value.map((voice) => {
    const env = el.adsr(
      +adsr.attack,
      +adsr.decay,
      +adsr.sustain,
      +adsr.release,
      //   el.const({ key: `${voice.key}:a`, value: 0 }),
      //   el.const({ key: `${voice.key}:d`, value: 0 }),
      //   el.const({ key: `${voice.key}:s`, value: 1 }),
      //   el.const({ key: `${voice.key}:r`, value: 10 }),
      el.const({ key: `${voice.key}:gate`, value: 0.2 * voice.gate })
    );

    return el.mul(
      env,
      el.cycle(el.const({ key: `${voice.key}:freq`, value: voice.freq }))
    );
  })
);

watch(computedVoices, () => {
  const out = el.add(...computedVoices.value);
  elementaryStore.getCore().render(out, out);
});

onMounted(async () => {
  await WebMidi.enable();
  console.log(
    "midi enabled",
    WebMidi.inputs.map((i) => i.name)
  );

  const selectedInput = WebMidi.inputs[0];
  selectedInput.addListener("noteon", (e) => {
    const midiNote = e.note.number;
    const key = "v" + midiNote;
    const freq = computeFrequency(midiNote);
    voices.value = voices.value
      .filter((voice: any) => voice.key !== key)
      .concat({ gate: 1, freq, key })
      .slice(-8);
  });

  selectedInput.addListener("noteoff", (e) => {
    const midiNote = e.note.number;
    const key = "v" + midiNote;
    voices.value = voices.value.map((voice: any) =>
      voice.key === key ? { ...voice, gate: 0 } : voice
    );
  });

  //   const voices = [
  //     { gate: 1.0, freq: 440, key: "v1" },
  //     { gate: 1.0, freq: 880, key: "v2" },
  //     { gate: 1.0, freq: 330, key: "v3" },
  //     { gate: 1.0, freq: 220, key: "v4" },
  //   ];

  //
});
</script>

<template>
  <p>Elementary</p>
  <div>
    <p>Attack ({{ adsr.attack }}s)</p>
    <BloopPotard :max="10" v-model="adsr.attack" :precision="2" />
    <p>Decay ({{ adsr.decay }}s)</p>
    <BloopPotard :max="10" v-model="adsr.decay" :precision="2" />
    <p>Sustain ({{ adsr.sustain }})</p>
    <BloopPotard :max="1" v-model="adsr.sustain" :precision="2" />
    <p>Release ({{ adsr.release }}s)</p>
    <BloopPotard :max="3" v-model="adsr.release" :precision="1" />
  </div>
  <pre>{{ voices }}</pre>
</template>

<style scoped>
div {
  display: flex;
}
</style>
