import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(async ({ attachLoggerSentryTransport }) => {
    attachLoggerSentryTransport(logger);
  });
}

export { createLogger, logger };
