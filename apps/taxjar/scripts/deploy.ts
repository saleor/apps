import { default as envUtils } from "@next/env";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

envUtils.loadEnvConfig(".");

async function setReleaseTag() {
  // Must use dynamic import for env variables to load properly
  const { exportSentryReleaseEnvironmentVariable } = await import("@saleor/sentry-utils");

  exportSentryReleaseEnvironmentVariable(packageJson.version);

  execSync("pnpm run build", { stdio: "inherit" });
}

setReleaseTag();
