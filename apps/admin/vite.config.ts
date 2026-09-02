import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/admin/',
  plugins: [tailwindcss(), reactRouter()],
  server: {
    port: 5173,
    host: true,
    fs: { allow: ['../..'] },
  },
});
