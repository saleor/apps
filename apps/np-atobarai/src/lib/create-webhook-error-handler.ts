import { WebhookError } from "@saleor/app-sdk/handlers/shared";

import { createLogger } from "./logger";

/**
 * SDK passes request validation failures (wrong event, unknown installation, bad signature) as WebhookError
 * and responds with 4xx - caller's fault, so log as warning to not trigger alerts. Anything else is our failure (500).
 */
export const createWebhookErrorHandler = (loggerName: string) => (error: unknown) => {
  const logger = createLogger(loggerName);

  if (error instanceof WebhookError) {
    logger.warn("Rejected invalid webhook request", { error: error });

    return;
  }

  logger.error("Failed to execute webhook", { error: error });
};
