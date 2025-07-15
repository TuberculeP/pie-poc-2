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
    const result = await apiClient.post<{ success: boolean }>(
      "/auth/login",
      form,
    );
    if (result.status === 200) {
      console.log(
        "\x1b[44m%s\x1b[0m",
        "webapp/src/components/auth/LoginForm.vue:29 was not authenticated",
      );
    } else if (result.status === 400) {
      console.log(
        "\x1b[44m%s\x1b[0m",
        "webapp/src/components/auth/LoginForm.vue:32 was authenticated",
      );
      isLogged.value = true;
    } else {
      console.error("Erreur lors de l'authentification :", result.data);
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
