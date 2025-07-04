import { createRouter, createWebHistory } from "vue-router";

import LandingIndex from "./views/landing/LandingIndex.vue";

// Bloob Webapp
import BloopApp from "./views/app/BloopApp.vue";
import GridTimeline from "./views/app/GridTimeline.vue";

const routes = [
  { path: "/", component: LandingIndex },
  { path: "/app", component: BloopApp, name: "app-main" },
  { path: "/grid", component: GridTimeline, name: "app-grid-timeline" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
