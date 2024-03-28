import { execSync } from "child_process";
import packageJson from "../package.json";

// todo: move to shared

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

export const getReleaseTag = () => {
  const version = packageJson.version;

  if (process.env.NODE_ENV === "production" && process.env.ENV === "production") {
    return version;
  }

  return `${version}-${getCommitHash() ?? "<unknown_commit_hash>"}`;
};
