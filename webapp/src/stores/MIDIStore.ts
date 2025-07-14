import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import type { Note } from "../lib/utils/types";

export const useMIDIStore = defineStore("midiStore", () => {
  const midiAccess = ref<MIDIAccess | null>(null);
  const midiInputs = ref<MIDIInput[]>([]);
  const midiOutputs = ref<MIDIOutput[]>([]);

  const keyboardConfiguration = ref("azerty");

  const keyToNoteMap: Record<string, Record<string, Note>> = {
    azerty: {
      a: { frequency: 261.63, key: "a", color: "white", scale: "C4" }, // C4
      é: { frequency: 277.18, key: "é", color: "black", scale: "C#4" }, // C#4
      z: { frequency: 293.66, key: "z", color: "white", scale: "D4" }, // D4
      '"': { frequency: 311.13, key: '"', color: "black", scale: "D#4" }, // D#4
      e: { frequency: 329.63, key: "e", color: "white", scale: "E4" }, // E4
      r: { frequency: 349.23, key: "r", color: "white", scale: "F4" }, // F4
      "(": { frequency: 369.99, key: "(", color: "black", scale: "F#4" }, // F#4
      t: { frequency: 392.0, key: "t", color: "white", scale: "G4" }, // G4
      "§": { frequency: 415.3, key: "§", color: "black", scale: "G#4" }, // G#4
      y: { frequency: 440.0, key: "y", color: "white", scale: "A4" }, // A4
      è: { frequency: 466.16, key: "è", color: "black", scale: "A#4" }, // A#4
      u: { frequency: 493.88, key: "u", color: "white", scale: "B4" }, // B4
      i: { frequency: 523.25, key: "i", color: "white", scale: "C5" }, // C5
      ç: { frequency: 554.37, key: "ç", color: "black", scale: "C#5" }, // C#5
      o: { frequency: 587.33, key: "o", color: "white", scale: "D5" }, // D5
      à: { frequency: 622.25, key: "à", color: "black", scale: "D#5" }, // D#5
      p: { frequency: 659.25, key: "p", color: "white", scale: "E5" }, // E5
      "^": { frequency: 698.46, key: "^", color: "white", scale: "F5" }, // F5
      "-": { frequency: 739.99, key: "-", color: "black", scale: "F#5" }, // F#5
      w: { frequency: 130.81, key: "w", color: "white", scale: "C3" }, // C3
      s: { frequency: 138.59, key: "s", color: "black", scale: "C#3" }, // C#3
      x: { frequency: 146.83, key: "x", color: "white", scale: "D3" }, // D3
      d: { frequency: 155.56, key: "d", color: "black", scale: "D#3" }, // D#3
      c: { frequency: 164.81, key: "c", color: "white", scale: "E3" }, // E3
      v: { frequency: 174.61, key: "v", color: "white", scale: "F3" }, // F3
      g: { frequency: 185.0, key: "g", color: "black", scale: "F#3" }, // F#3
      b: { frequency: 196.0, key: "b", color: "white", scale: "G3" }, // G3
      h: { frequency: 207.65, key: "h", color: "black", scale: "G#3" }, // G#3
      n: { frequency: 220.0, key: "n", color: "white", scale: "A3" }, // A3
      j: { frequency: 233.08, key: "j", color: "black", scale: "A#3" }, // A#3
      ",": { frequency: 246.94, key: ",", color: "white", scale: "B3" }, // B3
      ";": { frequency: 261.63, key: ";", color: "white", scale: "C4" }, // C4
      l: { frequency: 277.18, key: "l", color: "black", scale: "C#4" }, // C#4
      ":": { frequency: 293.66, key: ":", color: "white", scale: "D4" }, // D4
      m: { frequency: 311.13, key: "m", color: "black", scale: "D#4" }, // D#4
      "=": { frequency: 329.63, key: "=", color: "white", scale: "E4" }, // E4
    },
  };

  const currentKeyToNoteMap = computed<Record<string, Note>>(
    () => keyToNoteMap[keyboardConfiguration.value],
  );

  const pressedKeys = ref<Record<string, boolean>>({});

  const initializeMIDI = async () => {
    try {
      midiAccess.value = await navigator.requestMIDIAccess();
      midiInputs.value = Array.from(midiAccess.value.inputs.values());
      midiOutputs.value = Array.from(midiAccess.value.outputs.values());
    } catch (error) {
      console.error("Failed to access MIDI devices:", error);
    }
  };

  const onNotePlayedCallbackList = ref<((...args: any) => void)[]>([]);
  const onNoteStoppedCallbackList = ref<((...args: any) => void)[]>([]);
  const onNotePlayedCallbackRegistrer = (callback: (...args: any) => void) =>
    onNotePlayedCallbackList.value.push(callback);
  const onNoteStoppedCallbackRegistrer = (callback: (...args: any) => void) =>
    onNoteStoppedCallbackList.value.push(callback);

  onMounted(() => {
    window.addEventListener("keydown", (event) => {
      const cleanedKey = event.key.toLowerCase().trim();
      if (pressedKeys.value[cleanedKey]) {
        return;
      }
      pressedKeys.value[cleanedKey] = true;
      const note = currentKeyToNoteMap.value[cleanedKey];
      if (note) {
        onNotePlayedCallbackList.value.forEach((callback) =>
          callback(note, cleanedKey),
        );
      }
    });
    window.addEventListener("keyup", (event) => {
      const cleanedKey = event.key.toLowerCase().trim();
      pressedKeys.value[cleanedKey] = false;
      const note = currentKeyToNoteMap.value[cleanedKey];
      if (note) {
        onNoteStoppedCallbackList.value.forEach((callback) =>
          callback(note, cleanedKey),
        );
      }
    });
  });

  return {
    // general
    onNotePlayed: onNotePlayedCallbackRegistrer,
    onNoteStopped: onNoteStoppedCallbackRegistrer,
    // keyboard
    keyboardConfiguration,
    currentKeyToNoteMap,
    // midi
    midiAccess,
    midiInputs,
    midiOutputs,
    initializeMIDI,
  };
});
