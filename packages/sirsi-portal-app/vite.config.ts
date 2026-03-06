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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate cached chunks
          'vendor-react': ['react', 'react-dom', 'react-dom/client'],
          'vendor-recharts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],
          'vendor-router': ['@tanstack/react-router'],
        },
      },
    },
  },
})
