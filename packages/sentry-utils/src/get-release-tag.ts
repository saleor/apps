import { getCommitHash } from "./get-commit-hash";

export const getReleaseTag = (version: string) => {
  if (process.env.NODE_ENV === "production" && process.env.ENV === "production") {
    return version;
  }

  return `${version}-${getCommitHash() ?? "<unknown_commit_hash>"}`;
};
