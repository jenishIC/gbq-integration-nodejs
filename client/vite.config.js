import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/oauth2callback': 'http://localhost:3000',
      '/grant-access': 'http://localhost:3000',
      '/revoke': 'http://localhost:3000',
    }
  }
})
