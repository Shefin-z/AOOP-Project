import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
});
