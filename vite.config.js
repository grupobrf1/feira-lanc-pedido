import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    open: "/login", // Abre automaticamente a página de login
    proxy: {
      "/api": {
        target: "https://api-feira.azurewebsites.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        login: resolve(__dirname, "public/index.html"),
        lanc_pedido: resolve(__dirname, "public/lanc_pedido.html"),
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
