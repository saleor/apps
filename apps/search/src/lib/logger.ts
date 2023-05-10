import { createLogger as _createLogger } from "@saleor/apps-shared";

/**
 * Extend factory to add more settings specific for the app
 */
export const logger = _createLogger(
  {},
  {
    redact: ["token", "secretKey"],
  }
);

export const createLogger = logger.child.bind(logger);
