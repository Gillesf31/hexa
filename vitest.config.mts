import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@hexa/appointments-domain': fileURLToPath(new URL('./libs/appointments/domain/src/index.ts', import.meta.url)),
      '@hexa/appointments-ports': fileURLToPath(new URL('./libs/appointments/ports/src/index.ts', import.meta.url)),
      '@hexa/appointments-application': fileURLToPath(new URL('./libs/appointments/application/src/index.ts', import.meta.url)),
      '@hexa/appointments-infrastructure': fileURLToPath(new URL('./libs/appointments/infrastructure/src/index.ts', import.meta.url)),
      '@hexa/appointments-feature': fileURLToPath(new URL('./libs/appointments/feature/src/index.ts', import.meta.url)),
    },
  },
});
