import { type NextApiResponse } from "next";

import { AlgoliaErrorParser } from "../lib/algolia/algolia-error-parser";

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
  const algoliaStatusCode = AlgoliaErrorParser.getStatusCode(e);

  if (algoliaStatusCode === null) {
    logger.error(message, { error: e });

    res.status(500).send("Operation failed due to error");

    return;
  }

  logger.warn(message, { error: e, algoliaStatusCode });

  res.status(algoliaStatusCode).send(AlgoliaErrorParser.getErrorMessage(e));
};
