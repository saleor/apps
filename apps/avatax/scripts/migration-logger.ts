// eslint-disable-next-line no-restricted-imports
import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";
import { attachLoggerOtelTransport } from "@saleor/apps-logger/node";

import { env } from "@/env";

import packageJson from "../package.json";
import { loggerContext } from "../src/logger-context";

logger.settings.maskValuesOfKeys = ["username", "password", "token"];

if (env.ENABLE_MIGRATION_CONSOLE_LOGGER) {
  attachLoggerConsoleTransport(logger);
}

attachLoggerOtelTransport(logger, packageJson.version, loggerContext);

export { createLogger, logger };
