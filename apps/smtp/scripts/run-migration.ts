import { parseArgs } from "node:util";

import * as Sentry from "@sentry/nextjs";

import { env } from "../src/env";
import { createMigrationScriptLogger } from "./migration-logger";

const {
  values: { "dry-run": _dryRun },
} = parseArgs({
  options: {
    "dry-run": {
      type: "boolean",
      default: false,
    },
  },
});

const logger = createMigrationScriptLogger("RemoveDigitalContentUrlMigration");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const runMigration = async () => {
  // no op
};

runMigration();

process.on("beforeExit", () => {
  logger.info(`Migration complete for all environments from ${env.APL} APL`);
  process.exit(0);
});
