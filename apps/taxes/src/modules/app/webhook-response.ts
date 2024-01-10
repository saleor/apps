import * as Sentry from "@sentry/nextjs";
import { NextApiResponse } from "next";

import { CriticalError, ExpectedError } from "../../error";
import { createLogger } from "../../logger";

export class WebhookResponse {
  private logger = createLogger("WebhookResponse");
  constructor(private res: NextApiResponse) {}

  private respondWithError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  error(error: unknown) {
    if (error instanceof CriticalError) {
      Sentry.captureException(error);
      this.logger.error("CriticalError occurred", { error });
      return this.respondWithError(error.message);
    }

    if (error instanceof ExpectedError) {
      this.logger.warn("ExpectedError occurred", { error });
      return this.respondWithError(error.message);
    }

    Sentry.captureMessage("Unhandled error occurred");
    Sentry.captureException(error);
    this.logger.error("Unhandled error occurred", { error });
    return this.respondWithError("Unhandled error occurred");
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
