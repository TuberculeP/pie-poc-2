<script setup lang="ts">
import { ref } from "vue";
import apiClient from "../lib/utils/apiClient";

const file = ref<File | null>(null);
const message = ref<string | null>(null);

const uploadedFileUrl = ref<string | null>(null);

const uploadFile = async () => {
  console.log(
    "\x1b[44m%s\x1b[0m",
    "webapp/src/views/TestView.vue:9 file",
    file,
  );
  if (!file.value) {
    message.value = "Veuillez sélectionner un fichier.";
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  const response = await apiClient.post<{ url: string }>(
    "/shared/uploads",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  if (response.data && response.error === null) {
    uploadedFileUrl.value = response.data.url;
    message.value = "Fichier téléchargé avec succès.";
  } else {
    message.value = `Erreur: ${response.error}`;
  }
};
</script>

<template>
  <div>
    <h1>Test Upload</h1>
    <form @submit.prevent="uploadFile">
      <input
        type="file"
        @change="
          (e: Event) => {
            const target = e.target as HTMLInputElement;
            file = target?.files?.[0] || null;
          }
        "
      />
      <button type="submit">Envoyer</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <img v-if="uploadedFileUrl" :src="uploadedFileUrl" alt="Uploaded File" />
  </div>
</template>
