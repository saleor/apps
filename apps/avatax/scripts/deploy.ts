import { wrapWithSentryRelease } from "@saleor/sentry-utils";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

wrapWithSentryRelease({
  cmd: "pnpm run build",
  packageVersion: packageJson.version,
});

execSync("pnpm run migrate", { stdio: "inherit" });
