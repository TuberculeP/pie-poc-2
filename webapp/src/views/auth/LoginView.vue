<template>
  <h2>Login</h2>
  <div>
    <input type="email" v-model="form.email" placeholder="Email" />
    <input type="password" v-model="form.password" placeholder="Mot de passe" />
    <button @click="submitForm">Envoyer</button>
    <router-link :to="{ name: 'app-register' }">
      Pas encore inscrit ?
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import apiClient from "../../lib/utils/apiClient";
import { useRouter } from "vue-router";
import type { User } from "../../lib/utils/types";

const router = useRouter();

// retrieve redirect path from query params
const redirect = router.currentRoute.value.query.redirect as string;
const form = reactive({
  email: "",
  password: "",
});

async function submitForm() {
  const result = await apiClient.post<{ user: User }>("/auth/login", form);
  if (!result.error) {
    router.push({ name: redirect ?? "landing-main" });
  } else {
    console.error("Erreur lors de la connexion :", result.error);
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
