import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Bachelorarbeit/',        // <– ganz wichtig für GitHub Pages!
  assetsInclude: ['**/*.glsl'],
});
