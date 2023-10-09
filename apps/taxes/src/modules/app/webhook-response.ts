import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";
import { TaxError } from "../taxes/tax-error";

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  private respondWithError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  error(error: unknown) {
    if (error instanceof TaxError) {
      this.logger.error({ error }, "TaxError occurred");
      return this.respondWithError(error.message);
    }

    this.logger.error({ error }, "Unexpected error occurred");
    return this.respondWithError("Unexpected error occurred");
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
