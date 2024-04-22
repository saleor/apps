import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["username", "password", "apiKey"];

if (process.env.NODE_ENV !== "production") {
  attachLoggerConsoleTransport(logger);
}

import("@saleor/apps-logger/node").then(async ({ attachLoggerOtelTransport }) => {
  const loggerContext = await import("./logger-context").then((m) => m.loggerContext);

  attachLoggerOtelTransport(logger, require("../package.json").version, loggerContext);
});

export { createLogger, logger };
