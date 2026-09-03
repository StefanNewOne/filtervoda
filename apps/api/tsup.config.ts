import { defineConfig } from 'tsup';

// Bundle the API for production. The workspace package (@filtervoda/shared) is inlined so the
// runtime never has to resolve TS source; node_modules deps stay external (installed at runtime).
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  noExternal: [/@filtervoda\/shared/],
  outDir: 'dist',
});
