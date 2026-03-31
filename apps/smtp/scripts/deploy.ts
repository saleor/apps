import { execSync } from "node:child_process";

import { exportSentryReleaseEnvironmentVariable } from "@saleor/sentry-utils";

import packageJson from "../package.json";

exportSentryReleaseEnvironmentVariable(packageJson.version);

execSync("pnpm run build", { stdio: "inherit" });
execSync("pnpm --silent run dump-templates | pnpm --silent run audit-helpers", {
  stdio: "inherit",
  shell: "/bin/sh",
});
