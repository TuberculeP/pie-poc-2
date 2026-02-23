<template>
  <div class="sample-uploader">
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="audio/*"
        multiple
        @change="handleFileSelect"
        class="hidden-input"
      />
      <div class="drop-content">
        <span class="drop-icon">🎵</span>
        <p>
          Drag audio files here or
          <button type="button" @click="fileInput?.click()" class="browse-btn">
            browse
          </button>
        </p>
        <span class="drop-hint">MP3, WAV, OGG, FLAC (max 50MB)</span>
      </div>
    </div>

    <div v-if="uploadQueue.length" class="upload-queue">
      <div v-for="item in uploadQueue" :key="item.id" class="queue-item">
        <span class="file-name">{{ item.file.name }}</span>
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: item.progress + '%' }"
            ></div>
          </div>
          <span
            class="status"
            :class="{
              uploading: item.status === 'uploading',
              complete: item.status === 'complete',
              error: item.status === 'error',
            }"
          >
            {{ item.status === 'uploading' ? `${item.progress}%` : item.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAdminStore } from "../../stores/adminStore";

const props = defineProps<{
  packSlug: string;
  folderName?: string;
  folderId: string;
}>();

const emit = defineEmits<{
  (e: "uploaded", sample: any): void;
}>();

const adminStore = useAdminStore();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const uploadQueue = ref<
  Array<{
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "complete" | "error";
  }>
>([]);

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files) processFiles(Array.from(files));
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    processFiles(Array.from(input.files));
    input.value = "";
  }
}

async function processFiles(files: File[]) {
  for (const file of files) {
    if (!file.type.startsWith("audio/")) {
      console.warn(`Skipping non-audio file: ${file.name}`);
      continue;
    }

    const item = {
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "uploading" as const,
    };
    uploadQueue.value.push(item);

    try {
      // Upload file
      item.progress = 25;
      const uploadResult = await adminStore.uploadFile(
        file,
        props.packSlug,
        props.folderName
      );

      if (!uploadResult) {
        throw new Error("Upload failed");
      }

      item.progress = 50;

      // Create sample record
      const sampleName = file.name.replace(/\.[^/.]+$/, "");
      const result = await adminStore.createSample(props.folderId, {
        name: sampleName,
        filename: uploadResult.filename,
        previewUrl: uploadResult.url,
        fullUrl: uploadResult.url,
      });

      item.progress = 100;
      item.status = "complete";

      if (result.data?.body) {
        emit("uploaded", result.data.body);
      }

      // Remove from queue after delay
      setTimeout(() => {
        const index = uploadQueue.value.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          uploadQueue.value.splice(index, 1);
        }
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      item.status = "error";
    }
  }
}
</script>

<style scoped lang="scss">
.sample-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed rgba(122, 15, 62, 0.5);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.15s;
  cursor: pointer;

  &:hover,
  &.drag-over {
    border-color: #ff3fb4;
    background: rgba(255, 63, 180, 0.05);
  }
}

.hidden-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon {
  font-size: 36px;
}

.drop-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.browse-btn {
  background: none;
  border: none;
  color: #ff3fb4;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #e0359e;
  }
}

.drop-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.upload-queue {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1a0e15;
  border-radius: 8px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #f2efe8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff3fb4;
  transition: width 0.2s ease;
}

.status {
  font-size: 11px;
  font-weight: 500;
  min-width: 60px;
  text-align: right;

  &.uploading {
    color: #ff3fb4;
  }

  &.complete {
    color: #22c55e;
  }

  &.error {
    color: #ef4444;
  }
}
</style>
