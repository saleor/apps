import { type AuthData } from "@saleor/app-sdk/APL";
import { type NextApiResponse } from "next";

import { AlgoliaInvalidAppIdError } from "../lib/algolia/algolia-errors";
import { createSearchProblemReporter } from "../modules/app-problems";

/**
 * Checks if the error is an AlgoliaInvalidAppIdError.
 * If so, reports a problem, deactivates the app, and sends a 401 response.
 * Returns true if the error was handled, false otherwise.
 */
export async function handleInvalidAppIdError({
  error,
  authData,
  res,
  logger,
}: {
  error: unknown;
  authData: AuthData;
  res: NextApiResponse;
  logger: { warn: (message: string, params?: Record<string, unknown>) => void };
}): Promise<boolean> {
  if (!(error instanceof AlgoliaInvalidAppIdError)) {
    return false;
  }

  logger.warn("Algolia Application ID does not exist, deactivating app", {
    appId: authData.appId,
  });

  const problemReporter = createSearchProblemReporter(authData);

  await problemReporter.reportInvalidAppIdAndDeactivate(authData.appId);

  res.status(401).send("Algolia Application ID does not exist. App has been deactivated.");

  return true;
}
