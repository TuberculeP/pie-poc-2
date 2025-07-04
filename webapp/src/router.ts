import { createRouter, createWebHistory } from "vue-router";

import BloopHome from "./views/BloopHome.vue";

// Bloob Webapp
import BloopApp from "./views/app/BloopApp.vue";

const routes = [
  { path: "/", component: BloopHome },
  { path: "/app", component: BloopApp, name: "app-main" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
