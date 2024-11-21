import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // Optional: Enable Hot Module Replacement
    open: true, // Optional: Open browser on start
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Ensures the app is optimized correctly
      },
    },
  },
});
