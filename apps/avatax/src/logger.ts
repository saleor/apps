import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

import packageJson from "../package.json";
import { env } from "./env";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  // Don't remove require - it's necessary for proper logger initialization
  const {
    attachLoggerSentryTransport,
    attachLoggerVercelTransport,
  } = require("@saleor/apps-logger/node");

  attachLoggerSentryTransport(logger);

  if (env.NODE_ENV === "production") {
    attachLoggerVercelTransport(
      logger,
      packageJson.version,
      require("./logger-context").loggerContext,
    );
  }
}

export { createLogger, logger };
