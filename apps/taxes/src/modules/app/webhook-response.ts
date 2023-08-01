import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";

class WebhookErrorResolver {
  private logger: Logger;
  constructor() {
    this.logger = createLogger({ event: "WebhookErrorResolver" });
  }

  private resolveError(error: unknown) {
    if (error instanceof Error) {
      this.logger.error(error.stack, "Unexpected error caught:");
      return error.message;
    }
    return "Internal server error";
  }

  resolve(error: unknown) {
    return this.resolveError(error);
  }
}

export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  error(error: unknown) {
    const errorResolver = new WebhookErrorResolver();
    const errorMessage = errorResolver.resolve(error);

    this.logger.debug({ errorMessage }, "Responding to Saleor with error:");

    return this.res.status(500).json({ error: errorMessage });
  }

  success(data?: unknown) {
    return this.res.status(200).json(data ?? {});
  }
}
