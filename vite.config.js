import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/urban-veins/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
        },
      },
    },
  },
})
