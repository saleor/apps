import { BaseError } from "@saleor/errors";
import { type NextApiResponse } from "next";

export const AppNotConfiguredError = BaseError.subclass("AppNotConfiguredError", {
  props: { _brand: "AppNotConfiguredError" as const },
});

type Logger = {
  warn: (message: string, params?: Record<string, unknown>) => void;
  error: (message: string, params?: Record<string, unknown>) => void;
};

/**
 * Webhooks are delivered before the merchant configures the app (e.g. right after install).
 * That's expected, so it's logged as a warning. Other failures are unexpected and stay errors.
 * Both return 400 to Saleor.
 */
export const handleWebhookContextError = ({
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
  if (e instanceof AppNotConfiguredError) {
    logger.warn(message, { error: e });
  } else {
    logger.error(message, { error: e });
  }

  res.status(400).send((e as Error).message);
};
