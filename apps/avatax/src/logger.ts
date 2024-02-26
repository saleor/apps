import { logger, createLogger, LoggerContext } from "@saleor/apps-logger";
import { attachLoggerConsoleTransport } from "@saleor/apps-logger/src/logger-console-transport";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

export const loggerContext = new LoggerContext();

if (typeof window === "undefined") {
  import("@saleor/apps-logger").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../package.json").version, loggerContext);
    },
  );
}

export { logger, createLogger };
