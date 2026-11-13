import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    setupFiles: ["fake-indexeddb/auto"],
    include: ["src/**/*.test.ts"],
    // Las fechas de las pruebas se leen en la hora del centro de México.
    env: { TZ: "America/Mexico_City" },
  },
});
