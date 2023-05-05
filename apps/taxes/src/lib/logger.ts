import { createLogger as _createLogger, Logger } from "@saleor/apps-shared";

export const logger = _createLogger({
  redact: [
    "metadata",
    "providerInstance.config.username",
    "providerInstance.config.password",
    "providerInstance.config.apiKey",
  ],
});

export const createLogger = logger.child.bind(logger);

export type { Logger };
