import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    css: false,
    mockReset: true,
    restoreMocks: true,
    workspace: [
      {
        extends: true,
        test: {
          sequence: {
            shuffle: true,
          },
          include: ["src/**/*.test.ts"],
          name: "unit",
          setupFiles: "./src/__tests__/setup.ts",
          environment: "jsdom",
        },
      },
    ],
  },
});
