import { createRouter, createWebHistory } from "vue-router";

import LandingIndex from "./views/landing/LandingIndex.vue";

// Bloob Webapp
import BloopApp from "./views/app/BloopApp.vue";
import AuthView from "./views/auth/AuthView.vue";

const routes = [
  { path: "/", component: LandingIndex },
  { path: "/app", component: BloopApp, name: "app-main" },
  { path: "/auth", component: AuthView, name: "app-auth" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
