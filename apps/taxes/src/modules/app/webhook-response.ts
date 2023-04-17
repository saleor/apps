import { NextApiResponse } from "next";
import { Logger } from "pino";
import { createLogger } from "../../lib/logger";

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
    return this.res.status(200).json({
      status: 200,
      data,
    });
  }
}
