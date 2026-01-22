<template>
  <div class="equalizer-container">
    <h3>Égaliseur</h3>
    <canvas
      ref="canvas"
      class="eq-canvas"
      width="480"
      height="200"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    ></canvas>
    <div class="eq-info">Draggez les points pour ajuster les fréquences</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useSequencerStore } from "../../stores/sequencerStore";

const canvas = ref<HTMLCanvasElement | null>(null);
const store = useSequencerStore();
let isDrawing = false;
let draggedPointIndex = -1;

interface ControlPoint {
  freq: number;
  gain: number;
  label: string;
}

// Points de contrôle pour la courbe (bass, mid, treble)
const controlPoints = ref<ControlPoint[]>([
  { freq: 200, gain: 0, label: "Bass" },
  { freq: 1000, gain: 0, label: "Mid" },
  { freq: 3000, gain: 0, label: "Treble" },
]);

const width = 480;
const height = 200;
const padding = 40;
const graphWidth = width - padding * 2;
const graphHeight = height - padding * 2;
const pointRadius = 6;

// Échelle logarithmique pour les fréquences
const logScale = (freq: number): number => {
  const minFreq = 20;
  const maxFreq = 20000;
  return (
    (Math.log10(freq) - Math.log10(minFreq)) /
    (Math.log10(maxFreq) - Math.log10(minFreq))
  );
};

const freqToX = (freq: number): number => {
  return padding + logScale(freq) * graphWidth;
};

const gainToY = (gain: number): number => {
  // Gain de -12 à +12 dB, au centre = 0dB
  const normalized = (gain + 12) / 24; // 0 à 1
  return height - padding - normalized * graphHeight;
};

const xToFreq = (x: number): number => {
  const minFreq = 20;
  const maxFreq = 20000;
  const normalized = (x - padding) / graphWidth;
  return minFreq * Math.pow(maxFreq / minFreq, normalized);
};

const yToGain = (y: number): number => {
  const normalized = (height - padding - y) / graphHeight;
  const gain = normalized * 24 - 12; // -12 à +12 dB
  return Math.max(-12, Math.min(12, gain));
};

// Mettre à jour les points de contrôle à partir du store
const updatePointsFromStore = () => {
  controlPoints.value[0].gain = store.bass ?? 0;
  controlPoints.value[1].gain = store.mid ?? 0;
  controlPoints.value[2].gain = store.treble ?? 0;
};

// Mettre à jour le store à partir des points de contrôle
const updateStoreFromPoints = () => {
  store.bass = Math.round(controlPoints.value[0].gain * 100) / 100;
  store.mid = Math.round(controlPoints.value[1].gain * 100) / 100;
  store.treble = Math.round(controlPoints.value[2].gain * 100) / 100;
};

watch(
  () => [store.bass, store.mid, store.treble],
  () => {
    updatePointsFromStore();
    if (canvas.value) drawCurve();
  },
);

const handleMouseDown = (e: MouseEvent) => {
  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Vérifier si on a cliqué sur un point de contrôle
  for (let i = 0; i < controlPoints.value.length; i++) {
    const point = controlPoints.value[i];
    const px = freqToX(point.freq);
    const py = gainToY(point.gain);
    const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

    if (distance < pointRadius * 1.5) {
      isDrawing = true;
      draggedPointIndex = i;
      break;
    }
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!canvas.value || !isDrawing || draggedPointIndex === -1) return;

  const rect = canvas.value.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Mettre à jour le gain du point (la fréquence reste fixe)
  const newGain = yToGain(y);
  controlPoints.value[draggedPointIndex].gain = Math.max(
    -12,
    Math.min(12, newGain),
  );

  updateStoreFromPoints();
  drawCurve();
};

const handleMouseUp = () => {
  isDrawing = false;
  draggedPointIndex = -1;
};

const handleMouseLeave = () => {
  isDrawing = false;
  draggedPointIndex = -1;
};

const drawCurve = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  // Fond
  ctx.fillStyle = "#061b33";
  ctx.fillRect(0, 0, width, height);

  // Grille
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;

  // Lignes verticales (fréquences)
  const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  freqs.forEach((freq) => {
    const x = freqToX(freq);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  });

  // Ligne horizontale au centre (0dB)
  const centerY = gainToY(0);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(padding, centerY);
  ctx.lineTo(width - padding, centerY);
  ctx.stroke();

  // Autres lignes horizontales (-12, -6, 6, 12)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  [-12, -6, 6, 12].forEach((gain) => {
    const y = gainToY(gain);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  });

  // Dessiner la courbe interpolée avec Bézier
  ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  // Créer des points pour la courbe Bézier
  const curvePoints: Array<{ x: number; y: number }> = [];

  // Ajouter points avant le premier point de contrôle
  for (let x = padding; x <= freqToX(controlPoints.value[0].freq); x += 1) {
    // const freq = xToFreq(x);
    const gain = controlPoints.value[0].gain;
    curvePoints.push({ x, y: gainToY(gain) });
  }

  // Ajouter points entre bass et mid avec interpolation lisse
  for (
    let x = freqToX(controlPoints.value[0].freq);
    x <= freqToX(controlPoints.value[1].freq);
    x += 1
  ) {
    const freq = xToFreq(x);
    const t =
      (Math.log10(freq) - Math.log10(controlPoints.value[0].freq)) /
      (Math.log10(controlPoints.value[1].freq) -
        Math.log10(controlPoints.value[0].freq));
    // Interpolation lissée avec easing
    const easedT = t * t * (3 - 2 * t); // Smoothstep
    const gain =
      controlPoints.value[0].gain +
      (controlPoints.value[1].gain - controlPoints.value[0].gain) * easedT;
    curvePoints.push({ x, y: gainToY(gain) });
  }

  // Ajouter points entre mid et treble avec interpolation lisse
  for (
    let x = freqToX(controlPoints.value[1].freq);
    x <= freqToX(controlPoints.value[2].freq);
    x += 1
  ) {
    const freq = xToFreq(x);
    const t =
      (Math.log10(freq) - Math.log10(controlPoints.value[1].freq)) /
      (Math.log10(controlPoints.value[2].freq) -
        Math.log10(controlPoints.value[1].freq));
    // Interpolation lissée avec easing
    const easedT = t * t * (3 - 2 * t); // Smoothstep
    const gain =
      controlPoints.value[1].gain +
      (controlPoints.value[2].gain - controlPoints.value[1].gain) * easedT;
    curvePoints.push({ x, y: gainToY(gain) });
  }

  // Ajouter points après le dernier point de contrôle
  for (
    let x = freqToX(controlPoints.value[2].freq);
    x <= width - padding;
    x += 1
  ) {
    const gain = controlPoints.value[2].gain;
    curvePoints.push({ x, y: gainToY(gain) });
  }

  // Dessiner la courbe avec quadraticCurveTo pour une courbe lisse
  if (curvePoints.length > 0) {
    ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
    for (let i = 1; i < curvePoints.length - 1; i++) {
      const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
      const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
    }
    // Dernier point
    ctx.lineTo(
      curvePoints[curvePoints.length - 1].x,
      curvePoints[curvePoints.length - 1].y,
    );
  }

  ctx.stroke();

  // Dessiner les points de contrôle
  controlPoints.value.forEach((point, index) => {
    const x = freqToX(point.freq);
    const y = gainToY(point.gain);

    // Ombre
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, pointRadius + 1, 0, Math.PI * 2);
    ctx.fill();

    // Cercle
    ctx.fillStyle =
      draggedPointIndex === index
        ? "rgba(255, 100, 100, 1)"
        : "rgba(100, 200, 255, 1)";
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.fill();

    // Bordure
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${point.label} ${point.gain > 0 ? "+" : ""}${Math.round(point.gain * 10) / 10}dB`,
      x,
      y - pointRadius - 8,
    );
  });

  // Axes et labels
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;

  // Axe vertical gauche
  ctx.beginPath();
  ctx.moveTo(padding - 5, padding);
  ctx.lineTo(padding - 5, height - padding);
  ctx.stroke();

  // Axe horizontal bas
  ctx.beginPath();
  ctx.moveTo(padding, height - padding + 5);
  ctx.lineTo(width - padding, height - padding + 5);
  ctx.stroke();

  // Labels d'axes
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";

  // Fréquences
  freqs.forEach((freq) => {
    const x = freqToX(freq);
    const label = freq < 1000 ? `${freq}Hz` : `${(freq / 1000).toFixed(1)}kHz`;
    ctx.fillText(label, x, height - padding + 18);
  });

  // Gains
  ctx.textAlign = "right";
  [-12, -6, 0, 6, 12].forEach((gain) => {
    const y = gainToY(gain);
    const label = gain > 0 ? `+${gain}` : `${gain}`;
    ctx.fillText(label + "dB", padding - 12, y + 3);
  });
};

onMounted(() => {
  updatePointsFromStore();
  drawCurve();
});
</script>

<style scoped lang="scss">
.equalizer-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .eq-canvas {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: crosshair;
    background-color: #0a1f33;
  }

  .eq-info {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
