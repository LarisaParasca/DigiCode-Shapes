import { defineConfig } from 'vite';

export default defineConfig({
  base: '/DigiCode-Shapes/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'ES2022', 
  },
});
