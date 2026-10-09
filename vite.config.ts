import react from '@vitejs/plugin-react';
import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import svgr from 'vite-plugin-svgr';

const ROOT = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  root: ROOT,
  publicDir: false,
  cacheDir: fileURLToPath(new URL('./node_modules/.vite', import.meta.url)),

  plugins: [
    react({
      compiler: true,
    }),

    svgr({
      svgrOptions: {
        exportType: 'default',
        svgo: false,
        titleProp: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': ROOT,
    },
  },

  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    strictPort: true,
  },
});
