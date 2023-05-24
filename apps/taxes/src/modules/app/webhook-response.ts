import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";
import { ExpectedError } from "../taxes/tax-provider-error";

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  private returnSuccess(data?: any) {
    this.logger.debug({ data }, "success called with:");
    return this.res.status(200).json(data ?? {});
  }

  private returnError(errorMessage: string) {
    this.logger.debug({ errorMessage }, "returning error:");
    return this.res.status(500).json({ error: errorMessage });
  }

  private resolveError(error: unknown) {
    /*
     * Sometimes we want to break the tax calculation flow for expected reasons.
     * In this case, we throw the error to bubble it up and then we catch it here
     * to return a success (falling back to default) response.
     */
    if (error instanceof ExpectedError) {
      this.logger.error(error.message, "Expected error caught:");
      this.logger.debug(error.stack);
      return this.returnSuccess();
    }

    if (error instanceof Error) {
      this.logger.error(error.stack, "Unexpected error caught:");
      this.logger.debug(error.stack);
      return this.returnError(error.message);
    }
    return this.returnError("Internal server error");
  }

  error(error: unknown) {
    return this.resolveError(error);
  }

  success(data?: any) {
    return this.returnSuccess(data);
  }
}
