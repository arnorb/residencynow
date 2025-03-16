import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0, // Disable inlining assets to ensure fonts are properly bundled
    rollupOptions: {
      output: {
        manualChunks: {
          // Group PDF-related dependencies together
          'pdf-renderer': ['@react-pdf/renderer']
        }
      }
    }
  }
})
