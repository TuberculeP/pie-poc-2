import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  root: "webapp",
});
