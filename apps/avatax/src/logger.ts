import { logger, createLogger, attachLoggerConsoleTransport } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport, LoggerContext }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(
        logger,
        require("../package.json").version,
        require("./logger-context").loggerContext,
      );
    },
  );
}

export { logger, createLogger };
