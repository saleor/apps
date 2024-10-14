import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  const appsLogger = require("@saleor/apps-logger/node");

  appsLogger.attachLoggerSentryTransport(logger);

  if (process.env.NODE_ENV === "production") {
    appsLogger.attachLoggerVercelTransport(logger, require("./logger-context").loggerContext);
  }
}

export { createLogger, logger };
