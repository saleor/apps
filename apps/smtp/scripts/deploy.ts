import packageJson from "../package.json";

import { execSync } from "node:child_process";

const getCommitHash = () => {
  if (process.env.VERCEL) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA;
  }
  try {
    const result = execSync("git rev-parse HEAD");

    return result.toString().trim();
  } catch (e) {
    console.warn("Cannot fetch commit hash", e);
    return null;
  }
};

const getReleaseTag = (version: string) => {
  if (process.env.NODE_ENV === "production" && process.env.ENV === "production") {
    return version;
  }

  return `${version}-${getCommitHash() ?? "<unknown_commit_hash>"}`;
};

execSync("pnpm run build", { stdio: "inherit" });

const release = getReleaseTag(packageJson.version);

console.log("Using release tag:", release);

execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
