import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  root: './',
  optimizeDeps: {
    include: [
      '@heroicons/react',
      '@heroicons/react/24/solid',
      '@heroicons/react/24/outline',
      '@headlessui/react'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
    rollupOptions: {
      external: [
        '@heroicons/react',
        '@heroicons/react/24/solid',
        '@heroicons/react/24/outline',
        '@headlessui/react'
      ],
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'logo.png') {
            return 'assets/logo.png';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, '../types'),
      '@heroicons/react': path.resolve(__dirname, 'node_modules/@heroicons/react'),
      '@heroicons/react/24/solid': path.resolve(__dirname, 'node_modules/@heroicons/react/24/solid'),
      '@heroicons/react/24/outline': path.resolve(__dirname, 'node_modules/@heroicons/react/24/outline'),
      '@headlessui/react': path.resolve(__dirname, 'node_modules/@headlessui/react')
    }
  },
  publicDir: 'public'
})
