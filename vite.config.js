import { defineConfig } from "vite";
import { resolve } from "path";
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: "src",
  base: './',
  server: {
    host: true,
    port: 3000,
    open: "/login", // Abre automaticamente a página de login
    proxy: {
      "/api": {
        target: "https://feira-api.grupobrf1.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: resolve(__dirname, "src/index.html"),
        lanc_pedido: resolve(__dirname, "src/lanc_pedido.html"),
        dark_mode: resolve(__dirname, "src/dark-mode-toggle.css"),
        lanc_pedido_js: resolve(__dirname, "src/lanc_pedido.js"),
        login_js: resolve(__dirname, "src/login.js"),
        style: resolve(__dirname, "src/style.css"),
        iconbrf1: resolve(__dirname, "public/brf1.ico"),
        eyeico: resolve(__dirname, "src/icons/eye-off.svg"),
        eye: resolve(__dirname, "src/icons/eye.svg")
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    {
      name: "html-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/lanc_pedido") {
            req.url = "/lanc_pedido.html";
          }
          if (req.url === "/login") {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
  ],
});
