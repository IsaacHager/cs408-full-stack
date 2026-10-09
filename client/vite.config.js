import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, envDir, '')
  const backendPort = env.PORT || 3000

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': `http://localhost:${backendPort}`,
      },
    },
  }
})