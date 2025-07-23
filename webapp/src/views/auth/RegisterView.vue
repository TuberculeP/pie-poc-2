<template>
<<<<<<< HEAD
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
      
      <button type="submit">
        Créer mon compte
      </button>
      
      <div class="form-footer">
        <router-link :to="{ name: 'app-login' }" class="login-link">
          Déjà inscrit ? Se connecter
        </router-link>
      </div>
    </form>
  </div>
=======
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
>>>>>>> origin/main
</template>

<script setup lang="ts">
import { reactive } from "vue";
import apiClient from "../../lib/utils/apiClient";
<<<<<<< HEAD
import { useRouter } from "vue-router";

const router = useRouter();
=======
>>>>>>> origin/main

const form = reactive({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
});

async function submitForm() {
  try {
    const result = await apiClient.post("/auth/register", form);
<<<<<<< HEAD
    if (!result.error) {
      console.log("Inscription réussie:", result.data);
      // Rediriger vers la page de connexion après inscription
      router.push({ name: "app-login" });
    } else {
      console.error("Erreur lors de l'inscription:", result.error);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du formulaire:", error);
=======
    console.log(
      "\x1b[44m%s\x1b[0m",
      "webapp/src/components/FormulaireDégueulasse.vue:23 result",
      result.data,
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi du formulaire :", error);
>>>>>>> origin/main
  }
}
</script>

<style scoped>
<<<<<<< HEAD
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
=======
div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: baseline;
>>>>>>> origin/main
}
</style>
