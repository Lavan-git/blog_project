import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/shared': path.resolve(__dirname, '../shared/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 3000,
  },
build: {
  outDir: '../backend/dist/public',   // 👈 frontend build goes into backend/dist/public
  emptyOutDir: true,
  commonjsOptions: {
    include: [/node_modules/],
  },
},

})
