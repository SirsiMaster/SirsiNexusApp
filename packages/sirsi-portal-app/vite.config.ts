import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject version from package.json — single source of truth
    '__APP_VERSION__': JSON.stringify(pkg.version),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // shadcn/ui path alias
      '@': path.resolve(__dirname, './src'),
      // Force single React instance in monorepo
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
})
