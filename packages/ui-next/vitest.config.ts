import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    css: false,
    setupFiles: ["./src/setup-tests.ts"],
    sequence: {
      shuffle: true,
    },
  },
});
