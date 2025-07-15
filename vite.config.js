import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  root: "webapp",
});
