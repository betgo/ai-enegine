import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ai-enegine/runtime": fileURLToPath(new URL("../../packages/runtime/src/index.ts", import.meta.url)),
      "@ai-enegine/schema": fileURLToPath(new URL("../../packages/schema/src/index.ts", import.meta.url))
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
