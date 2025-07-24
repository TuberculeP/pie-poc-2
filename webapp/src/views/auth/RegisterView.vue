<template>
  <div class="register-container">
    <form class="form-container" @submit.prevent="submitForm">
      <h2>Inscription</h2>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="form.email"
          placeholder="Entrez votre email"
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
          required
        />
      </div>

      <div class="form-group">
        <label for="firstName">Prénom</label>
        <input
          id="firstName"
          type="text"
          v-model="form.firstName"
          placeholder="Entrez votre prénom"
          required
        />
      </div>

      <div class="form-group">
        <label for="lastName">Nom</label>
        <input
          id="lastName"
          type="text"
          v-model="form.lastName"
          placeholder="Entrez votre nom"
          required
        />
      </div>

      <button type="submit">Créer mon compte</button>

      <div class="form-footer">
        <router-link :to="{ name: 'app-login' }" class="login-link">
          Déjà inscrit ? Se connecter
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import apiClient from "../../lib/utils/apiClient";
import { useRouter } from "vue-router";

const router = useRouter();

const form = reactive({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
});

async function submitForm() {
  try {
    const result = await apiClient.post("/auth/register", form);
    if (!result.error) {
      console.log("Inscription réussie:", result.data);
      // Rediriger vers la page de connexion après inscription
      router.push({ name: "app-login" });
    } else {
      console.error("Erreur lors de l'inscription:", result.error);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du formulaire:", error);
  }
}
</script>

<style scoped>
.register-container {
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

.login-link {
  color: var(--color-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--color-secondary-hover);
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .form-container {
    padding: 24px;
    margin: 16px;
  }

  .register-container {
    min-height: 70vh;
  }
}
</style>
