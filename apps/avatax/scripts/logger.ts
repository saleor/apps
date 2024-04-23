import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";
import { attachLoggerOtelTransport } from "@saleor/apps-logger/node";
import { loggerContext } from "../src/logger-context";

logger.settings.maskValuesOfKeys = ["username", "password", "token"];

if (process.env.DANGEROUS_ENABLE_MIGRATION_CONSOLE_LOGGER === "true") {
  attachLoggerConsoleTransport(logger);
}

attachLoggerOtelTransport(logger, require("../package.json").version, loggerContext);

export { createLogger, logger };
