import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Bachelorarbeit/',
  assetsInclude: ['**/*.glsl'],
  build: {
    outDir: 'docs'  // ← Vite wird direkt hier rein bauen!
  }
});