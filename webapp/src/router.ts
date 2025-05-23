import { createRouter, createWebHistory } from "vue-router";

import BloopHome from "./views/BloopHome.vue";
import BloopApp from "./views/BloopApp.vue";

const routes = [
  { path: "/", component: BloopHome },
  { path: "/app", component: BloopApp },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
