import { type NextApiResponse } from "next";

import { AlgoliaErrorParser } from "../lib/algolia/algolia-error-parser";
import { SaleorRateLimitError } from "../lib/algolia/variants-availability";

type Logger = {
  warn: (message: string, params?: Record<string, unknown>) => void;
  error: (message: string, params?: Record<string, unknown>) => void;
};

/**
 * Errors returned by the Algolia API are caused by the merchant's Algolia account
 * (plan limits, quotas, rejected records) or by Algolia itself - not by a bug in this app,
 * so they are logged as warnings instead of errors.
 *
 * Algolia status code is passed back to Saleor: 4xx means the request will never succeed,
 * so Saleor should not retry it. 5xx is transient and worth retrying.
 * Errors that don't come from Algolia are unexpected - they stay errors and return 500.
 *
 * Saleor rate limiting the app's callback query is caused by the merchant's burst of changes
 * (e.g. bulk product edits). The event is acknowledged with 201 and dropped with a warning,
 * so the burst doesn't page us; the product is reindexed on its next change.
 */
export const handleAlgoliaWebhookError = ({
  error: e,
  logger,
  message,
  res,
}: {
  error: unknown;
  logger: Logger;
  message: string;
  res: NextApiResponse;
}) => {
  if (e instanceof SaleorRateLimitError) {
    logger.warn("Saleor API rate limited the app, skipping indexing of this event", { error: e });

    res.status(201).send("Skipped: Saleor API rate limited the app");

    return;
  }

  const algoliaStatusCode = AlgoliaErrorParser.getStatusCode(e);

  if (algoliaStatusCode === null) {
    logger.error(message, { error: e });

    res.status(500).send("Operation failed due to error");

    return;
  }

  logger.warn(message, { error: e, algoliaStatusCode });

  res.status(algoliaStatusCode).send(AlgoliaErrorParser.getErrorMessage(e));
};
