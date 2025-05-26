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
        catenoid: resolve(__dirname, 'catenoid.html'),
        cone: resolve(__dirname, 'cone.html'),
        cycloid: resolve(__dirname, 'cycloid.html')
      }
    }
  }
});
