import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
    coverage: {
      provider: "c8",
      reporter: ["text-summary", "cobertura"],
    },
  },
});
