<template>
  <h2>Login</h2>
  <div>
    <input type="email" v-model="form.email" placeholder="Email" />
    <input type="password" v-model="form.password" placeholder="Mot de passe" />
    <button @click="submitForm">Envoyer</button>
    <p v-if="isLogged">C'est bon</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import apiClient from "../../lib/utils/apiClient";

const isLogged = ref(false);

const form = reactive({
  email: "",
  password: "",
});

async function submitForm() {
  try {
    const result = await apiClient.postRequest<{ success: boolean }>(
      "/api/auth/login",
      form,
    );
    if (result.success) {
      isLogged.value = true;
    } else {
      isLogged.value = false;
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du formulaire :", error);
  }
}
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: baseline;
}
</style>
