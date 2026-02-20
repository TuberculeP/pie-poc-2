import type { EQBand } from "../utils/types";

export const EQ_GAIN_MAX = 18;
export const EQ_GAIN_MIN = -18;

export const DEFAULT_EQ_BANDS: EQBand[] = [
  { id: "sub", frequency: 60, gain: 0, type: "lowshelf", label: "Sub" },
  { id: "bass", frequency: 200, gain: 0, type: "peaking", label: "Bass" },
  { id: "mid", frequency: 1000, gain: 0, type: "peaking", label: "Mid" },
  {
    id: "presence",
    frequency: 3000,
    gain: 0,
    type: "peaking",
    label: "Presence",
  },
  {
    id: "brilliance",
    frequency: 10000,
    gain: 0,
    type: "highshelf",
    label: "Brilliance",
  },
];

export const EQ_BAND_COLORS: Record<string, string> = {
  sub: "#ff6b6b",
  bass: "#ffa94d",
  mid: "#69db7c",
  presence: "#4dabf7",
  brilliance: "#da77f2",
};

export const cloneEQBands = (): EQBand[] =>
  JSON.parse(JSON.stringify(DEFAULT_EQ_BANDS));

export const createImpulseResponse = (
  ctx: AudioContext,
  duration = 3,
  decay = 2.5,
  amplitude = 0.5,
): AudioBuffer => {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const d = Math.pow(1 - i / length, decay);
    const noise = (Math.random() * 2 - 1) * d * amplitude;
    left[i] = noise;
    right[i] = noise;
  }

  return buffer;
};

export const createEQFilter = (
  ctx: AudioContext,
  band: EQBand,
  q = 1.5,
): BiquadFilterNode => {
  const filter = ctx.createBiquadFilter();
  filter.type = band.type;
  filter.frequency.value = band.frequency;
  filter.gain.value = band.gain;
  if (band.type === "peaking") filter.Q.value = q;
  return filter;
};
