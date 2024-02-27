import { logger, createLogger, attachLoggerConsoleTransport } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["token", "secretKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../../package.json").version);
    },
  );
}

export { logger, createLogger };
