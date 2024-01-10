import { logger, createLogger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = [
  "metadata",
  "username",
  "providerInstance.config.username",
  "password",
  "apiKey",
];

if (typeof window === "undefined") {
  import("@saleor/apps-logger").then(
    ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      attachLoggerSentryTransport(logger);
      attachLoggerOtelTransport(logger, require("../package.json").version);
    },
  );
}

export { logger, createLogger };
