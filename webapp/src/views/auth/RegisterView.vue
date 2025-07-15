<template>
  <h2>Register</h2>
  <div>
    <input type="email" v-model="form.email" placeholder="Email" />
    <input type="password" v-model="form.password" placeholder="Mot de passe" />
    <input type="text" v-model="form.firstName" placeholder="Prénom" />
    <input type="text" v-model="form.lastName" placeholder="Nom" />
    <button @click="submitForm">Envoyer</button>
  </div>
  <p>
    Déjà inscrit ?
    <router-link :to="{ name: 'app-login' }"> Connectez-vous </router-link>
  </p>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import apiClient from "../../lib/utils/apiClient";

const form = reactive({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
});

async function submitForm() {
  try {
    const result = await apiClient.post("/auth/register", form);
    console.log(
      "\x1b[44m%s\x1b[0m",
      "webapp/src/components/FormulaireDégueulasse.vue:23 result",
      result.data,
    );
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
