import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Bachelorarbeit/',
  assetsInclude: ['**/*.glsl', '**/*.fe'],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        catenoid: resolve(__dirname, 'src/catenoid/catenoid.html'),
        catenoidWidget: resolve(__dirname, 'src/catenoid/catenoidWidget.html'),
        catenoidHelicoid: resolve(__dirname, 'src/catenoidHelicoid/catenoidHelicoid.html'),
        catenoidHelicoidWidget: resolve(__dirname, 'src/catenoidHelicoid/catenoidHelicoidWidget.html'),
        trochoid: resolve(__dirname, 'src/trochoid/trochoid.html'),
        trochoidWidget: resolve(__dirname, 'src/trochoid/trochoidWidget.html'),
        epitrochoid: resolve(__dirname, 'src/epitrochoid/epitrochoid.html'),
        epitrochoidWidget: resolve(__dirname, 'src/epitrochoid/epitrochoidWidget.html'),
        hypotrochoid: resolve(__dirname, 'src/hypotrochoid/hypotrochoid.html'),
        hypotrochoidWidget: resolve(__dirname, 'src/hypotrochoid/hypotrochoidWidget.html'),
        surfaceEvolver: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolver.html'),
        cubicSurface: resolve(__dirname, 'src/cubicSurface/cubicSurface.html'),
        cubicSurfaceWidget: resolve(__dirname, 'src/cubicSurface/cubicSurfaceWidget.html'),
        surfaceEvolverCatenoid: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolverCatenoid.html'),
        surfaceEvolverPcell: resolve(__dirname, 'src/surfaceEvolver/surfaceEvolverPcell.html'),
      }
    }
  }
});
