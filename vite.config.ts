import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: './client',  // Tell Vite the client files are in ./client
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Bind to all interfaces for Docker
    port: 5173,
    watch: {
      usePolling: true  // Better for Docker volume mounts
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
