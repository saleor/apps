import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

import packageJson from "../package.json";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  // Don't remove require - it's necessary for proper logger initialization
  const {
    attachLoggerSentryTransport,
    attachLoggerVercelTransport,
  } = require("@saleor/apps-logger/node");

  attachLoggerSentryTransport(logger);

  if (process.env.NODE_ENV === "production") {
    attachLoggerVercelTransport(
      logger,
      packageJson.version,
      require("./logger-context").loggerContext,
    );
  }
}

export { createLogger, logger };
