import { exportSentryReleaseEnvironmentVariable } from "@saleor/sentry-utils";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

const release = exportSentryReleaseEnvironmentVariable(packageJson.version);

execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
execSync("pnpm run migrate", { stdio: "inherit" });
