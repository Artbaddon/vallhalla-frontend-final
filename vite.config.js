import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3002,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL || 'http://localhost:3000/api'),
        VITE_APP_NAME: JSON.stringify(env.VITE_APP_NAME || 'Vallhalla'),
        VITE_APP_VERSION: JSON.stringify(env.VITE_APP_VERSION || '1.0.0')
      }
    }
  }
})
