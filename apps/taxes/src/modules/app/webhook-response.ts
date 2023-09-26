import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";
import { TaxBadWebhookPayloadError, TaxCriticalError } from "../taxes/tax-error";

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  private respondWithBadRequest(errorMessage: string) {
    // Are we sure its 400?
    return this.res.status(400).json({ error: errorMessage });
  }

  private respondWithInternalServerError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  error(error: unknown) {
    if (error instanceof TaxBadWebhookPayloadError) {
      this.logger.warn({ error }, "TaxBadWebhookPayloadError occurred");
      return this.respondWithBadRequest(error.message);
    }

    if (error instanceof TaxCriticalError) {
      this.logger.error({ error }, "TaxCriticalError occurred");
      return this.respondWithInternalServerError(error.message);
    }

    this.logger.error({ error }, "Unexpected error occurred");
    return this.respondWithInternalServerError("Unexpected error occurred");
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
