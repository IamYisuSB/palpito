/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// base './' para que el build funcione en cualquier subruta (Netlify/Vercel/GitHub Pages)
export default defineConfig({
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
