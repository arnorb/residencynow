import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

// Add Buffer polyfill for PDF rendering
import { Buffer } from 'buffer';

// Add global Buffer type for TypeScript
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

// Make Buffer available globally
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
