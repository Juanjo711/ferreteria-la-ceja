import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración Playwright.
 *
 * - webServer: levanta pnpm dev automáticamente si :3000 no está en uso
 *   (reuseExistingServer: true para iterar local sin re-arrancar).
 * - Solo Chromium en el MVP — los flujos cruzados con Safari/Firefox
 *   quedan como mejora futura.
 * - Cada test crea su propio usuario con email único basado en timestamp,
 *   así no necesitamos reset de DB entre runs.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // los flujos comparten el seed cliente@demo / admin@
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
