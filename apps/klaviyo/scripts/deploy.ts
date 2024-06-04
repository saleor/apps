import { getReleaseTag } from "@saleor/apps-shared";
import { execSync } from "child_process";
import packageJson from "../package.json";

const release = getReleaseTag(packageJson.version);

// eslint-disable-next-line no-console
console.log("Using release tag:", release);

execSync(`SENTRY_RELEASE='${release}' pnpm run build`, { stdio: "inherit" });
