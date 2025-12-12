<template>
  <header class="main_header" id="header">
    <a href="/" class="logo">
      <img src="../../assets/logo/logo_background_yellow.svg" alt="Logo" />
    </a>
    <div class="toggle" @click="toggleMenu" :class="{ active: isMenuOpen }">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <ul :class="{ active: isMenuOpen }" @click="handleMenuClick">
      <li><a href="#" @click="closeMenu">Produit</a></li>
      <li><a href="#" @click="closeMenu">Galerie</a></li>
      <li><a href="/blog" @click="closeMenu">Blog</a></li>
      <li><a href="#" @click="closeMenu">À propos</a></li>
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
          <router-link to="/messages" @click="closeProfileMenu"
            >Mes Messages</router-link
          >
          <a href="#" @click.prevent="handleLogout">Déconnexion</a>
        </div>
      </li>
      <!-- Boutons connexion/inscription si non connecté -->
      <!-- Si non connecté -->
      <li v-else class="start-now-dropdown" @mouseleave="showAuthMenu = false">
        <button class="start-now-btn" @click="showAuthMenu = !showAuthMenu">
          Start now
          <span class="dropdown-arrow">▼</span>
        </button>
        <div v-if="showAuthMenu" class="auth-dropdown">
          <router-link to="/login" @click="closeMenu">Connexion</router-link>
          <router-link to="/register" @click="closeMenu"
            >Inscription</router-link
          >
        </div>
      </li>
    </ul>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import apiClient from "../../lib/utils/apiClient";

const props = defineProps<{
  sticky?: boolean;
}>();

const router = useRouter();
const authStore = useAuthStore();
const showProfileMenu = ref(false);
const showAuthMenu = ref(false); // ✅ ajouté
const isMenuOpen = ref(false);

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

// Gestion du menu burger
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  showProfileMenu.value = false;
  showAuthMenu.value = false; // ✅ ajouté
};

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
  if (!target.closest(".start-now-dropdown")) {
    showAuthMenu.value = false; // ✅ ajouté
  }
};

// Déconnexion
const handleLogout = async () => {
  try {
    await apiClient.post("/auth/logout");
    authStore.user = undefined;
    closeProfileMenu();
    closeMenu();
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
    // Si la prop sticky est activée, toujours sticky
    if (props.sticky) {
      header.classList.add("sticky");
      return;
    }
    if (window.innerWidth > 1170) {
      header.classList.toggle("sticky", window.scrollY > 0);
    } else {
      header.classList.remove("sticky");
    }
  }
};

const handleResize = () => {
  if (window.innerWidth > 1170) {
    isMenuOpen.value = false;
    handleScroll();
  } else {
    const header = document.querySelector("header");
    if (header && !props.sticky) {
      header.classList.remove("sticky");
    }
  }
};

const handleMenuClick = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  if (clickX <= 60 && clickY <= 60) {
    closeMenu();
  }
};

onMounted(() => {
  checkAuth();
  handleScroll(); // Appliquer le sticky immédiatement si la prop est définie
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
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

/* Toggle Button (Burger Menu) */
.toggle {
  position: relative;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: none;
  flex-direction: column;
  justify-content: space-around;
}

.toggle span {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--color-white);
  border-radius: 3px;
  transition: 0.3s ease-in-out;
}

.toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.toggle.active span:nth-child(2) {
  opacity: 0;
}

.toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
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
  transition: color 0.3s;
}

header ul li a:hover {
  color: var(--color-accent);
}

header.sticky {
  background-color: var(--color-white);
  padding: 8px 96px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header.sticky .logo {
  color: #000;
}

header.sticky ul li a {
  color: #000;
}

header.sticky .toggle span {
  background: #000;
}

/* bouton drop down */

.start-now-dropdown {
  position: relative;
}

.start-now-btn {
  background-color: #ffd269; /* Jaune */
  color: #060b17; /* Bleu foncé */
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s ease;
}

.start-now-btn:hover {
  background-color: #e6bb4f;
}

.dropdown-arrow {
  font-size: 12px;
}

.auth-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;

  min-width: 150px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.auth-dropdown a {
  padding: 10px 14px;
  text-decoration: none;
  color: #060b17;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.auth-dropdown a:hover {
  background-color: #f5f5f5;
}

/* Boutons d'authentification */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-buttons .login-btn,
.auth-buttons .register-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0;
}

.auth-buttons .login-btn {
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.auth-buttons .login-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
}

.auth-buttons .register-btn {
  background: var(--color-accent);
  color: var(--color-black);
}

.auth-buttons .register-btn:hover {
  background: var(--color-accent-hover);
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
  margin: 0 !important;
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
header.sticky .auth-buttons .login-btn {
  color: #000;
  border-color: rgba(0, 0, 0, 0.2);
}

header.sticky .auth-buttons .login-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

header.sticky .profile-link {
  color: #000;
}

header.sticky .profile-link:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Media Queries */
@media screen and (max-width: 1170px) {
  header {
    padding: 20px 50px;
  }

  .toggle {
    display: flex;
  }

  header ul {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: translateY(-100vh);
    transition: transform 0.3s ease-in-out;
    backdrop-filter: blur(10px);
  }

  header ul::before {
    content: "✕";
    position: absolute;
    top: 30px;
    left: 30px;
    font-size: 2rem;
    color: #fff;
    cursor: pointer;
    z-index: 1001;
    transition: color 0.3s;
  }

  header ul::before:hover {
    color: var(--color-accent);
  }

  header ul.active {
    transform: translateY(0);
  }

  header ul li {
    margin: 20px 0;
  }

  header ul li a {
    font-size: 1.5rem;
    font-weight: 300;
    color: #fff;
    margin: 0;
  }

  header.sticky ul {
    background: rgba(255, 255, 255, 0.95);
  }

  header.sticky ul::before {
    color: #000;
  }

  header.sticky ul::before:hover {
    color: var(--color-accent);
  }

  header.sticky ul li a {
    color: #000;
  }

  /* Styles mobile pour l'authentification */
  .auth-buttons {
    flex-direction: column;
    gap: 1rem;
    margin: 20px 0;
  }

  .auth-buttons .login-btn,
  .auth-buttons .register-btn {
    padding: 12px 24px;
    font-size: 1.2rem;
    width: 200px;
    text-align: center;
  }

  .auth-buttons .login-btn {
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .auth-buttons .login-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  /* Menu profil mobile */
  .profile-menu {
    margin: 20px 0;
  }

  .profile-link {
    font-size: 1.2rem;
    padding: 12px 16px;
    color: #fff;
  }

  .profile-dropdown {
    position: static;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    margin-top: 10px;
    border-radius: 8px;
  }

  .profile-dropdown::before {
    display: none;
  }

  .profile-dropdown a {
    color: #fff;
    font-size: 1.1rem;
  }

  .profile-dropdown a:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-accent);
  }

  /* Styles sticky mobile pour profil */
  header.sticky .auth-buttons .login-btn {
    color: #000;
    border-color: rgba(0, 0, 0, 0.2);
  }

  header.sticky .auth-buttons .login-btn:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #000;
  }

  header.sticky .profile-link {
    color: #000;
  }

  header.sticky .profile-dropdown a {
    color: #000;
  }

  header.sticky .profile-dropdown a:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--color-accent);
  }
}
@media screen and (max-width: 1170px) {
  header .logo {
    display: none;
  }
  header {
    display: flex;
    justify-content: end;
  }
}

@media screen and (max-width: 570px) {
  header {
    padding: 20px 30px;
  }

  header ul {
    width: auto;
    margin: 0 auto;
  }

  .toggle {
    width: 25px;
    height: 25px;
  }

  header ul li a {
    font-size: 1.3rem;
  }

  .auth-buttons .login-btn,
  .auth-buttons .register-btn {
    padding: 10px 20px;
    font-size: 1.1rem;
    width: 180px;
  }

  .profile-name {
    display: none;
  }

  .profile-dropdown {
    min-width: 160px;
  }
}

@media screen and (min-width: 975px) {
  header ul.active {
    transform: none;
  }
}
</style>
