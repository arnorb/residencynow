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
  server: {
    cors: {
      origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Alternative local dev
        'https://arnarhlid2.habitera.is',  // Production URL
        process.env.VITE_SUPABASE_URL || '',  // Supabase project URL
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info'],
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
