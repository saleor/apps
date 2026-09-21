import { captureException } from "@sentry/nextjs";

import { createLogger } from "@/logger";

const logger = createLogger("calculateTaxes");

/**
 * Use only for failures we could NOT map to a known cause - not for errors caused by the
 * client / merchant configuration, which stay 4xx + warn.
 *
 * An unmapped error means there is nothing actionable to tell the merchant, so it has to reach
 * us instead: otherwise it sits behind a generic 500 with only a warning in the logs, and
 * nobody notices it for weeks.
 *
 * Contextual attributes (saleorApiUrl, channelSlug, checkoutId...) are attached by loggerContext.
 */
export const reportUnhandledCalculateTaxesError = (error: unknown, respondingWith: string) => {
  logger.error(`Responding with ${respondingWith} - unhandled tax calculation error`, {
    error:
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { message: String(error) },
  });

  captureException(error);
};
