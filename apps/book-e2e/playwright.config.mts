import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Generated as a .mts file so Node forces ESM regardless of workspace
 * `type`. Playwright routes `.mts` through its ESM loader (dynamic import,
 * bypassing the pirates CJS-compile path), and Nx's native TS strip loads
 * `.mts` directly. Playwright's configLoader auto-discovers
 * `playwright.config.mts` via its extension list
 * (.ts/.js/.mts/.mjs/.cts/.cjs).
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  webServer: {
    // `@nx/playwright/plugin` parses this command back out of the config and
    // turns it into a `dependsOn` on the inferred `e2e` target — confirm with
    // `npx nx show project book-e2e --json`. So Nx boots `book:serve-memory` as
    // a continuous task first, and :4200 is already answering by the time
    // Playwright looks.
    command: 'npx nx serve-memory book',
    url: 'http://localhost:4200',
    // Which is why this is `true` and not `!process.env.CI`. The usual advice
    // assumes Playwright owns the server; here it would make Playwright fight
    // Nx for the port.
    reuseExistingServer: true,
    // No explicit `timeout`. Playwright's default is 60s and a cold CI runner
    // reaches the first test in well under that — `gh run view --log` on the
    // e2e step prints the gap between `nx run book:serve-memory` and the run
    // summary. Tightening it would trade a cheap failure (waiting out a hang
    // that a 20-minute job timeout catches anyway) for an expensive one: a red
    // run on a noisy shared runner that nothing is actually wrong with.
    cwd: workspaceRoot,
  },
  // Chromium only. Nothing here is browser-specific yet, so a second engine
  // would triple the run for no extra signal. Add one when a test depends on
  // rendering rather than on wiring.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
