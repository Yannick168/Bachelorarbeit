import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Bachelorarbeit/',
  assetsInclude: ['**/*.glsl'],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        triangle: resolve(__dirname, 'index.html'),
        surface_01: resolve(__dirname, 'parametricSurface_01.html'),
        surface_02: resolve(__dirname, 'parametricSurface_02.html'),
        cone: resolve(__dirname, 'cone.html')
      }
    }
  }
});
