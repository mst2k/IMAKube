import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Load environment variables from the process.env
let port = parseInt(process.env.VITE_PORT || "5000", 10);
const origin = process.env.VITE_ORIGIN || `http://0.0.0.0:${port}`;

export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
    port: port,
    strictPort: true,
  },
  server: {
    port: port,
    strictPort: true,
    host: true,
    origin: origin,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
