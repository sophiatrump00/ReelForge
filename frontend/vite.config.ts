import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // When running in Docker, 'backend' is the container hostname
        // When running locally, use 'localhost'
        target: process.env.DOCKER_ENV ? 'http://backend:8000' : 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
