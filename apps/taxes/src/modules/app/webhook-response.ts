import * as Sentry from "@sentry/nextjs";
import { NextApiResponse } from "next";

import { CriticalError, ExpectedError } from "../../error";
import { createLogger, Logger } from "../../lib/logger";

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  private respondWithError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  error(error: unknown) {
    if (error instanceof CriticalError) {
      Sentry.captureException(error);
      this.logger.error({ error }, "CriticalError occurred");
      return this.respondWithError(error.message);
    }

    if (error instanceof ExpectedError) {
      this.logger.warn({ error }, "ExpectedError occurred");
      return this.respondWithError(error.message);
    }

    Sentry.captureMessage("Unhandled error occurred");
    Sentry.captureException(error);
    this.logger.error({ error }, "Unhandled error occurred");
    return this.respondWithError("Unhandled error occurred");
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
