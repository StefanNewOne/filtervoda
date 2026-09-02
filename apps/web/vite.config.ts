import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: {
    port: 3000,
    host: true,
    // Allow importing the shared design tokens from the monorepo root (_docs/design).
    fs: { allow: ['../..'] },
  },
});
