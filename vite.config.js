import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    open: "/fornecedor", // Abre automaticamente a página de fornecedor
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "public/index.html"),
        fornecedor: resolve(__dirname, "public/fornecedor.html"),
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
          if (req.url === "/fornecedor") {
            req.url = "/fornecedor.html";
          }
          if (req.url === "/index") {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
  ],
});
