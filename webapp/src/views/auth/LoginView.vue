<template>
  <div class="login-container">
    <form class="form-container" @submit.prevent="submitForm">
      <h2>Connexion</h2>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="form.email"
          placeholder="Entrez votre email"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          v-model="form.password"
          placeholder="Entrez votre mot de passe"
          class="form-input"
          required
        />
      </div>

      <button type="submit" class="submit-button">Se connecter</button>

      <div class="form-footer">
        <router-link :to="{ name: 'app-register' }" class="register-link">
          Pas encore inscrit ? Créer un compte
        </router-link>
      </div>
    </form>
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
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}

.form-container {
  max-width: 400px;
  width: 100%;
}

.form-container h2 {
  color: var(--color-white);
  text-align: left;
  margin-bottom: 24px;
  font-size: 1.8rem;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-secondary);
}

.register-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: var(--color-secondary-hover);
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .form-container {
    padding: 24px;
    margin: 16px;
  }

  .login-container {
    min-height: 70vh;
  }
}
</style>
