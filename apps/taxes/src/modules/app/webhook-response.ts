import { NextApiResponse } from "next";

import { createLogger, Logger } from "../../lib/logger";

/*
 * idea: distinguish between async and sync webhooks
 * when sync webhooks, require passing the event and enforce the required response format using ctx.buildResponse
 * when async webhooks, dont require anything
 */
export class WebhookResponse {
  private logger: Logger;
  constructor(private res: NextApiResponse) {
    this.logger = createLogger({ event: "WebhookResponse" });
  }

  failure(error: string) {
    this.logger.debug({ error }, "failure called with:");
    return this.res.status(500).json({ error });
  }

  success(data?: any) {
    this.logger.debug({ data }, "success called with:");
    return this.res.send(data);
  }
}
