import { execSync } from "node:child_process";

/**
 * Wraps command with Sentry release tag. Wrapped command is executed using node `execSync` function.
 *
 * @param {string} params.cmd - The command to be executed.
 * @param {string} params.packageVersion - The version of the package.
 *
 * @example
 * wrapWithSentryRelease({ cmd: 'npm run build', packageVersion: '1.0.0' });
 */
export const wrapWithSentryRelease = ({
  cmd,
  packageVersion,
}: {
  cmd: string;
  packageVersion: string;
}) => {
  const release = getReleaseTag(packageVersion);

  console.log("Using release tag:", release);

  execSync(`SENTRY_RELEASE='${release}' ${cmd}`, { stdio: "inherit" });
};

const getReleaseTag = (version: string) => {
  if (process.env.NODE_ENV === "production" && process.env.ENV === "production") {
    return version;
  }

  return `${version}-${getCommitHash() ?? "<unknown_commit_hash>"}`;
};

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
