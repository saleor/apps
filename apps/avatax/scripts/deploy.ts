import { execSync } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

const runDeployment = async () => {
  // Must use dynamic import for env variables to load properly
  const { getReleaseTag } = await import("../src/release-utils");

  const release = getReleaseTag();

  console.log("Using release tag:", release);

  execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
  execSync("pnpm run migrate", { stdio: "inherit" });
};

runDeployment();
