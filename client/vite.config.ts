import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for faster builds

    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'react-vendor': ['react', 'react-dom', 'wouter'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
          'table-vendor': ['@tanstack/react-table', '@tanstack/react-virtual', '@dnd-kit/core', '@dnd-kit/sortable'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['mapbox-gl'], // Mapbox is the biggest chunk
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://shadowcheck_backend:5000',
        changeOrigin: true,
      },
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      'mapbox-gl',
      '@tanstack/react-query',
      '@tanstack/react-table',
    ],
  },
});