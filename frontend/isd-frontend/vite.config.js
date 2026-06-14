import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Expõe para 0.0.0.0 (Essencial no Codespaces)
    port: 5173,
    strictPort: true, // Força a falhar se a porta estiver ocupada, em vez de pular para 5174
  }
})