import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";

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
    if (error instanceof Error) {
      this.logger.error(error.stack, "Unexpected error caught:");
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
