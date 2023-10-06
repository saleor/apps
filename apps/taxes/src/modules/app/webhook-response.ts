import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";
import { TaxBadWebhookPayloadError, TaxCriticalError } from "../taxes/tax-error";

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  private respondWithError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  error(error: unknown) {
    if (error instanceof TaxBadWebhookPayloadError) {
      this.logger.error({ error }, "TaxBadWebhookPayloadError occurred");
      return this.respondWithError(error.message);
    }

    if (error instanceof TaxCriticalError) {
      this.logger.error({ error }, "TaxCriticalError occurred");
      return this.respondWithError(error.message);
    }

    this.logger.error({ error }, "Unexpected error occurred");
    return this.respondWithError("Unexpected error occurred");
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
