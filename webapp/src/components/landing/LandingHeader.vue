<template>
  <header class="main_header" id="header">
    <a href="/" class="logo">
      <img src="../../assets/logo/logo_background_yellow.svg" alt="Logo" />
    </a>
    <div class="toggle"></div>
    <ul>
      <li><a href="#">Produit</a></li>
      <li><a href="#">Galerie</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="#">À propos</a></li>
      <li><a href="#">Support</a></li>
      <!-- Bouton profil si connecté -->
      <li v-if="isAuthenticated" class="profile-menu">
        <a href="#" @click.prevent="toggleProfileMenu" class="profile-link">
          <span class="profile-avatar">{{ userInitials }}</span>
          <span class="profile-name">{{ user?.firstName || "Profil" }}</span>
          <span class="dropdown-arrow">▼</span>
        </a>
        <div v-if="showProfileMenu" class="profile-dropdown">
          <router-link to="/profile" @click="closeProfileMenu"
            >Mon Profil</router-link
          >
          <a href="#" @click.prevent="handleLogout">Déconnexion</a>
        </div>
      </li>
      <!-- Boutons connexion/inscription si non connecté -->
      <li v-else class="auth-buttons">
        <router-link to="/login" class="login-btn">Connexion</router-link>
        <router-link to="/register" class="register-btn"
          >Inscription</router-link
        >
      </li>
    </ul>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import apiClient from "../../lib/utils/apiClient";

const router = useRouter();
const authStore = useAuthStore();
const showProfileMenu = ref(false);

// États réactifs
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

// Initiales de l'utilisateur pour l'avatar
const userInitials = computed(() => {
  if (!user.value) return "?";
  const firstName = user.value.firstName || "";
  const lastName = user.value.lastName || "";
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
});

// Gestion du menu profil
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const closeProfileMenu = () => {
  showProfileMenu.value = false;
};

// Fermer le menu si on clique ailleurs
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".profile-menu")) {
    showProfileMenu.value = false;
  }
};

// Déconnexion
const handleLogout = async () => {
  try {
    await apiClient.post("/auth/logout");
    authStore.user = undefined;
    closeProfileMenu();
    router.push("/");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

// Vérifier l'authentification au montage
const checkAuth = async () => {
  try {
    const response = await apiClient.get<{ user: any }>("/auth/check");
    if (response.data?.user) {
      authStore.user = response.data.user;
    }
  } catch (error) {
    // Utilisateur non connecté
    authStore.user = undefined;
  }
};

// Effet sticky du header
const handleScroll = () => {
  const header = document.querySelector("header");
  if (header) {
    header.classList.toggle("sticky", window.scrollY > 0);
  }
};

onMounted(() => {
  checkAuth();
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 40px 100px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.5s;
}
header .logo img {
  width: 120px;
}
@media screen and (max-width: 570px) {
  header .logo {
    display: none;
  }

  header ul {
    width: auto;
    margin: 0 auto;
  }
}
header ul {
  position: relative;
  display: flex;
  align-items: center;
}
header ul li {
  position: relative;
  list-style: none;
  margin-right: 50px;
}
header ul li a {
  font-weight: 200;
  position: relative;
  display: inline-block;
  margin: 0 15px;
  color: var(--color-white);
  text-decoration: none;
}
header ul li a:hover {
  color: var(--color-accent);
}

header.sticky {
  background-color: var(--color-white);
  padding: 8px 96px;
}
header.sticky .logo {
  color: #000;
}
header.sticky ul li a {
  color: #000;
}

/* Boutons d'authentification */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;

  .login-btn,
  .register-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .login-btn {
    color: var(--color-white);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .login-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-white);
  }

  .register-btn {
    background: var(--color-accent);
    color: var(--color-black);
  }

  .register-btn:hover {
    background: var(--color-accent-hover);
  }
}

/* Menu de profil */
.profile-menu {
  position: relative;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.profile-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-white);
}

.profile-name {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.profile-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-white);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 8px 0;
  z-index: 1000;
  margin-top: 8px;
}

.profile-dropdown::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 20px;
  width: 12px;
  height: 12px;
  background: var(--color-white);
  transform: rotate(45deg);
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.1);
}

.profile-dropdown a {
  display: block;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-weight: 400;
  transition: background 0.2s ease;
}

.profile-dropdown a:hover {
  background: #f5f5f5;
  color: var(--color-accent);
}

/* Styles sticky pour le profil */
header.sticky .login-btn {
  color: #000;
  border-color: rgba(0, 0, 0, 0.2);
}

header.sticky .login-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

header.sticky .profile-link {
  color: #000;
}

header.sticky .profile-link:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Responsive pour les nouveaux éléments */
@media screen and (max-width: 570px) {
  .auth-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .login-btn,
  .register-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .profile-link {
    padding: 6px 8px;
  }

  .profile-name {
    display: none;
  }

  .profile-dropdown {
    right: -20px;
    min-width: 160px;
  }
}
</style>
