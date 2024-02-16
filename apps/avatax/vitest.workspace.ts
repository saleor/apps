/* eslint-disable import/no-default-export */
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "react",
    },
  },
  {
    test: {
      include: ["integration/**/*.test.ts"],
      name: "integration",
      environment: "node",
    },
  },
]);
