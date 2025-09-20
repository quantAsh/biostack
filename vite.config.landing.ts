import { defineConfig } from 'vite'
// @ts-ignore: plugin types may not be installed in minimal environments
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  base: '/',
  build: {
    outDir: 'dist-landing',
    rollupOptions: {
      input: path.resolve(process.cwd(), 'landing.html'),
    },
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})
