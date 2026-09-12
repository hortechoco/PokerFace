import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo: hortechoco/PokerFace → se publica en https://hortechoco.github.io/PokerFace/
// Si el repo cambia de nombre, actualiza `base` para que coincida (debe empezar y
// terminar con "/"). Se puede sobreescribir en build con: VITE_BASE=/otro/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE ?? '/PokerFace/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
