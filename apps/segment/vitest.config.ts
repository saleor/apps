import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    css: false,
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      "@/generated": new URL("./generated/", import.meta.url).pathname,
    },
  },
});
