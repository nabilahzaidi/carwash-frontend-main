import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5170,
    strictPort: true, // Supaya dia tak melompat ke port lain kalau 5170 tengah sibuk
  }
})