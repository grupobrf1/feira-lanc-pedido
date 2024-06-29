import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    open: "/login_vendedor", // Abre automaticamente a página de login
  },
  build: {
    rollupOptions: {
      input: {
        login_vendedor: resolve(__dirname, "public/login_vendedor.html"),
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
          if (req.url === "/login_vendedor") {
            req.url = "/login_vendedor.html";
          }
          next();
        });
      },
    },
  ],
});
