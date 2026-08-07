import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@hexa/appointments-domain': fileURLToPath(new URL('./libs/appointments/domain/src/index.ts', import.meta.url)),
      '@hexa/appointments-ports': fileURLToPath(new URL('./libs/appointments/ports/src/index.ts', import.meta.url)),
      '@hexa/appointments-application': fileURLToPath(new URL('./libs/appointments/application/src/index.ts', import.meta.url)),
      '@hexa/appointments-infrastructure': fileURLToPath(new URL('./libs/appointments/infrastructure/src/index.ts', import.meta.url)),
      '@hexa/appointments-state': fileURLToPath(new URL('./libs/appointments/state/src/index.ts', import.meta.url)),
      '@hexa/appointments-ui': fileURLToPath(new URL('./libs/appointments/ui/src/index.ts', import.meta.url)),
      '@hexa/appointments-feature': fileURLToPath(new URL('./libs/appointments/feature/src/index.ts', import.meta.url)),
    },
  },
  test: {
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
    // Component specs need the Angular AOT compiler for signal inputs, so the ui
    // library runs through `nx test appointments-ui` (@angular/build:unit-test).
    exclude: ['**/node_modules/**', '**/dist/**', 'libs/appointments/ui/**'],
  },
});
