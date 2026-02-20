import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { i18n } from "./lib/lang";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/authStore";

import "./styles/reset.css";
import "./styles/colors.css";
import "./styles/base.css";
import "./styles/blog.css";
import "./styles/tailwind.css";

const pinia = createPinia();
const app = createApp(App).use(router).use(i18n).use(pinia);

const authStore = useAuthStore(pinia);
authStore.loadConfig();

app.mount("#app");
