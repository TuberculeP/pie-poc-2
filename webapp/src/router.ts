import { createRouter, createWebHistory } from "vue-router";

import LandingIndex from "./views/landing/LandingIndex.vue";
import BloopApp from "./views/app/BloopApp.vue";
import LoginView from "./views/auth/LoginView.vue";
import RegisterView from "./views/auth/RegisterView.vue";

import { useAuthStore } from "./stores/authStore";
import apiClient from "./lib/utils/apiClient";
import type { User } from "./lib/utils/types";

async function authGuard(to: any, from: any, next: any) {
  const authStore = useAuthStore();
  const check = await apiClient.get<{ user: User }>("/auth/check");
  if (check.error) {
    next({ name: "app-login", query: { redirect: to.name } });
    return;
  }
  if (check.data && check.data.user) {
    authStore.user = check.data.user;
    next();
  } else {
    next({ name: "app-login", query: { redirect: to.name } });
  }
}
import BlogApp from "./views/blog/BlogApp.vue";

const routes = [
  { path: "/", component: LandingIndex, name: "landing-main" },
  { path: "/app", component: BloopApp, name: "app-main" },
  { path: "/login", component: LoginView, name: "app-login" },
  { path: "/register", component: RegisterView, name: "app-register" },
  { path: "/blog", component: BlogApp, name: "app-blog" },
];

const getGuardedRoutes = () => {
  const guardedMatches = ["app", "blog", "settings", "profile"];
  return routes.map((route) => {
    if (guardedMatches.some((match) => route.path.includes(match))) {
      return {
        ...route,
        beforeEnter: authGuard,
      };
    }
    return route;
  });
};

export const router = createRouter({
  history: createWebHistory(),
  routes: getGuardedRoutes(),
});
