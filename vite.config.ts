import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // Build date stamped into the bundle at compile time. Prerendered pages carry
  // it as dateModified / article:modified_time so crawlers see a fresh, honest
  // signal on every deploy (the tours table has no updated_at column).
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
