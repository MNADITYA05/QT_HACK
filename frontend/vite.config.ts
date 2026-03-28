import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  base: command === "build" ? "/static/landing/" : "/",
  build: {
    outDir: "../QT_HACK-main/static/landing",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        puzzle: path.resolve(__dirname, "puzzle.html"),
        theory: path.resolve(__dirname, "theory.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": { target: "http://127.0.0.1:5000", changeOrigin: true },
      "/static": { target: "http://127.0.0.1:5000", changeOrigin: true },
    },
  },
}));
