import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Bắt buộc: mở host 0.0.0.0 để Docker truy cập được
    strictPort: true,
    watch: {
      usePolling: true,
    }
  }
})