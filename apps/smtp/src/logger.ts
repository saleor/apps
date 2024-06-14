import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";
import packageJson from "../package.json";

logger.settings.maskValuesOfKeys = ["metadata", "username", "password", "apiKey"];

attachLoggerConsoleTransport(logger);

if (typeof window === "undefined") {
  import("@saleor/apps-logger/node").then(
    async ({ attachLoggerOtelTransport, attachLoggerSentryTransport }) => {
      const loggerContext = await import("./logger-context").then((m) => m.loggerContext);

      attachLoggerOtelTransport(logger, packageJson.version, loggerContext);
    },
  );
}

export { createLogger, logger };
