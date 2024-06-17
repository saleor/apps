// eslint-disable-next-line no-restricted-imports
import { attachLoggerConsoleTransport, createLogger, logger } from "@saleor/apps-logger";

logger.settings.maskValuesOfKeys = ["username", "password", "token"];

attachLoggerConsoleTransport(logger);

export { createLogger, logger };
