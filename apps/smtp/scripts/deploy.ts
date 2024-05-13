import { execSync } from "child_process";
import { getReleaseTag } from "../src/release-utils";

const release = getReleaseTag();

console.log("Using release tag:", release);

execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
