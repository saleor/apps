import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    async ({ attachLoggerSentryTransport, attachLoggerVercelTransport }) => {
      const loggerContext = await import("./logger-context").then((m) => m.loggerContext);

      attachLoggerSentryTransport(logger);
      attachLoggerVercelTransport(logger, loggerContext);
    },
  );
}

export { createLogger, logger };
