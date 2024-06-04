import { default as envUtils } from "@next/env";

import packageJson from "../package.json";

envUtils.loadEnvConfig(".");

async function setReleaseTag() {
  // Must use dynamic import for env variables to load properly
  const { wrapWithSentryRelease } = await import("@saleor/sentry-utils");

  wrapWithSentryRelease({
    cmd: "pnpm run build",
    packageVersion: packageJson.version,
  });
}

setReleaseTag();
