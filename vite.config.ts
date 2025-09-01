import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Bachelorarbeit/',
  assetsInclude: ['**/*.glsl', '**/*.fe'],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        triangle: resolve(__dirname, 'src/triangle/index.html'),
        surface_01: resolve(__dirname, 'parametricSurface_01.html'),
        catenoid: resolve(__dirname, 'src/catenoid/catenoid.html'),
        catenoidHelicoid: resolve(__dirname, 'src/catenoidHelicoid/catenoidHelicoid.html'),
        cycloid: resolve(__dirname, 'src/cycloid/cycloid.html'),
        epitrochoid: resolve(__dirname, 'src/epitrochoid/epitrochoid.html'),
        hypotrochoid: resolve(__dirname, 'src/hypotrochoid/hypotrochoid.html'),
        surfaceEvolver: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolver.html'),
        cubicSurface: resolve(__dirname, 'src/cubicSurface/cubicSurface.html'),
        cubicSurfaceWidget: resolve(__dirname, 'src/cubicSurface/cubicSurfaceWidget.html'),
        cubicSurfaceTest: resolve(__dirname, 'src/cubicSurfaceTest/cubicSurface.html'),
        surfaceEvolverCatenoid: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolverCatenoid.html'),
        surfaceEvolverPcell: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolverPcell.html'),
      }
    }
  }
});
