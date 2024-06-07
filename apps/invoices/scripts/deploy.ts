import { wrapWithSentryRelease } from "@saleor/sentry-utils";

import packageJson from "../package.json";

wrapWithSentryRelease({
  cmd: "pnpm run build",
  packageVersion: packageJson.version,
});
