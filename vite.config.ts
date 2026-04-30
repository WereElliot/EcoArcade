import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        dashboard: fileURLToPath(new URL('./dashboard.app.html', import.meta.url)),
        popup: fileURLToPath(new URL('./popup.app.html', import.meta.url)),
        background: fileURLToPath(new URL('./src/background/index.ts', import.meta.url))
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return '[name].js';
          }

          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sidepanel.css') {
            return 'assets/[name].[ext]';
          }

          return 'assets/[name].[ext]';
        }
      }
    }
  }
});
