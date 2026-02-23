<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  waveformData: number[];
  startOffset: number;
  clipWidth: number;
  sampleDurationCols: number;
  color: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const drawWaveform = (): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  ctx.clearRect(0, 0, width, height);

  const data = props.waveformData;
  if (data.length === 0) return;

  const startRatio =
    props.sampleDurationCols > 0
      ? props.startOffset / props.sampleDurationCols
      : 0;
  const endRatio =
    props.sampleDurationCols > 0
      ? Math.min(
          1,
          (props.startOffset + props.clipWidth) / props.sampleDurationCols,
        )
      : 1;

  const startIndex = Math.floor(startRatio * data.length);
  const endIndex = Math.ceil(endRatio * data.length);
  const visibleData = data.slice(startIndex, endIndex);

  if (visibleData.length === 0) return;

  const midY = height / 2;

  ctx.beginPath();
  ctx.moveTo(0, midY);

  for (let i = 0; i < visibleData.length; i++) {
    const x = (i / visibleData.length) * width;
    const y = midY - visibleData[i] * midY * 0.85;
    ctx.lineTo(x, y);
  }

  for (let i = visibleData.length - 1; i >= 0; i--) {
    const x = (i / visibleData.length) * width;
    const y = midY + visibleData[i] * midY * 0.85;
    ctx.lineTo(x, y);
  }

  ctx.closePath();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let i = 0; i < visibleData.length; i++) {
    const x = (i / visibleData.length) * width;
    const y = midY - visibleData[i] * midY * 0.85;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
};

onMounted(() => {
  drawWaveform();
});

watch(
  () => [
    props.waveformData,
    props.startOffset,
    props.clipWidth,
    props.sampleDurationCols,
  ],
  () => {
    drawWaveform();
  },
  { deep: true },
);
</script>

<template>
  <canvas ref="canvasRef" class="waveform-canvas" />
</template>

<style scoped lang="scss">
.waveform-canvas {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>
