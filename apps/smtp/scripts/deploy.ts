import { exportSentryReleaseEnvironmentVariable } from "@saleor/sentry-utils";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

exportSentryReleaseEnvironmentVariable(packageJson.version);

execSync("pnpm run build", { stdio: "inherit" });
