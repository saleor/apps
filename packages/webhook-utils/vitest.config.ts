import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    passWithNoTests: true,
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
  },
});
