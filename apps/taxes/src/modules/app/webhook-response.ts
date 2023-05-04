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

  failureNoRetry(error: string) {
    this.logger.debug({ error }, "failureNoRetry called with:");
    return this.res.status(200).json({ success: false, error });
  }

  failureRetry(error: string) {
    this.logger.error({ error }, "failureRetry called with:");
    return this.res.status(500).json({ success: false, error });
  }

  success(data?: any) {
    this.logger.debug({ data }, "success called with:");
    return this.res.send(data);
  }
}
