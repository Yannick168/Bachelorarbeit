import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Bachelorarbeit/',
  assetsInclude: ['**/*.glsl'],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        surface: resolve(__dirname, 'parametricSurface_01.html'),
      },
    },
  },
});
