import { NextApiResponse } from "next";

import { CriticalError, ExpectedError } from "../../error";
import { createLogger } from "../../logger";

/**
 * @deprecated
 */
export class WebhookResponse {
  private logger = createLogger("WebhookResponse");
  constructor(private res: NextApiResponse) {}

  private respondWithError(errorMessage: string) {
    return this.res.status(500).json({ error: errorMessage });
  }

  /**
   * @deprecated use `NextApiResponse.res.status(500)` instead
   */
  error(error: unknown) {
    if (error instanceof CriticalError) {
      this.logger.error("CriticalError occurred", { error });
      return this.respondWithError(error.message);
    }

    if (error instanceof ExpectedError) {
      this.logger.warn("ExpectedError occurred", { error });
      return this.respondWithError(error.message);
    }

    this.logger.error("Unhandled error occurred", { error });
    return this.respondWithError("Unhandled error occurred");
  }

  /**
   * @deprecated use `NextApiResponse.status(200).end()` instead
   */
  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
