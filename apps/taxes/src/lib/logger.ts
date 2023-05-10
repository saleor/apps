import { Logger, logger as _logger } from "@saleor/apps-shared";

export const logger = _logger.child(
  {},
  {
    redact: [
      "metadata",
      "providerInstance.config.username",
      "providerInstance.config.password",
      "providerInstance.config.apiKey",
    ],
  }
);

export const createLogger = logger.child.bind(logger);

export type { Logger };
