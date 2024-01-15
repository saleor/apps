import { logger, createLogger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];
logger.settings.type = process.env.NODE_ENV === "production" ? "hidden" : "pretty";

if (typeof window === "undefined") {
  import("@saleor/apps-logger").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../package.json").version);
    },
  );
}

export { logger, createLogger };
