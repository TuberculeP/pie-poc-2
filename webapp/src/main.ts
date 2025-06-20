import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { i18n } from "./lib/lang";

createApp(App).use(router).use(i18n).mount("#app");
