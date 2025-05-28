import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

const {
  values: { ui: ui },
} = parseArgs({
  options: {
    ui: {
      type: "boolean",
      default: false,
    },
  },
});

// Wrapper for running Playwright tests that allows `tsx` to read env variables from file.

execSync(`pnpm exec playwright test ${ui ? "--ui" : ""}`, {
  stdio: "inherit",
});
