import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

/*
 * This config is used for ui tests, for all configurations see vitest.workspace.ts
 * Docs:
 *
 * https://vitejs.dev/config/
 * https://vitest.dev/guide/workspace.html#defining-a-workspace
 */
export default defineProject({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
  },
});
