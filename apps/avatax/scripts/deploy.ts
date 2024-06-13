import { exportSentryReleaseEnvironmentVariable } from "@saleor/sentry-utils";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

const release = exportSentryReleaseEnvironmentVariable(packageJson.version);

console.log(`Inferred release: ${release}`);

execSync(`pnpm run build`, {
  stdio: "inherit",
  env: {
    ...process.env,
    SENTRY_RELEASE: release,
  },
});
execSync("pnpm run migrate", { stdio: "inherit" });
