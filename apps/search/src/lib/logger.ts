import { logger, createLogger } from "@saleor/apps-logger";
import { attachLoggerConsoleTransport } from "@saleor/apps-logger/src/logger-console-transport";

logger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../../package.json").version);
    },
  );
}

export { logger, createLogger };
