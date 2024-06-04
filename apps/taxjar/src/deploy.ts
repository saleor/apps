import { default as envUtils } from "@next/env";
import { execSync } from "node:child_process";

import packageJson from "../package.json";

envUtils.loadEnvConfig(".");

async function setReleaseTag() {
  // Must use dynamic import for env variables to load properly
  const { getReleaseTag } = await import("@saleor/release-utils");
  const release = getReleaseTag(packageJson.version);

  console.log("Using release tag:", release);

  execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
}

setReleaseTag();
