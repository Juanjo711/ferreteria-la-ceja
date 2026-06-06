import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuración Vitest.
 *
 * - environment: node (los tests unitarios del MVP son lógica de servidor;
 *   no necesitamos jsdom todavía, lo activaremos cuando empecemos a
 *   testear componentes React).
 * - alias @/* apuntando a src/* para que las importaciones del código de
 *   producción funcionen en los tests sin cambios.
 * - tests/e2e/ excluido — Playwright tiene su propio runner.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
});
