import { logger, createLogger, attachLoggerConsoleTransport } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    async ({ attachLoggerOtelTransport, attachLoggerSentryTransport, LoggerContext }) => {
      const loggerContext = await import("./logger-context").then((m) => m.loggerContext);

      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../package.json").version, loggerContext);
    },
  );
}

export { logger, createLogger };
