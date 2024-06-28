import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    open: "/index.html", // Abre automaticamente a página de login
  },
  build: {
    rollupOptions: {
      input: {
        main: "./public/index.html", // Caminho correto para o index.html
      },
    },
  },
});
