import { execSync } from "node:child_process";

export const getCommitHash = () => {
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
