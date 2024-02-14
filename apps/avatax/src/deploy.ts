import { default as envUtils } from "@next/env";
import { execSync } from "child_process";

envUtils.loadEnvConfig(".");

async function setReleaseTag() {
  // Must use dynamic import for env variables to load properly
  const { getReleaseTag } = await import("./release-utils");
  const release = getReleaseTag();

  console.log("Using release tag:", release);

  execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
}

setReleaseTag();
