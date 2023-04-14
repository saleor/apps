import { NextApiResponse } from "next";

export class WebhookResponseFactory {
  constructor(private res: NextApiResponse) {}

  failureNoRetry(error: string) {
    return this.res.status(200).json({ success: false, error });
  }

  failureRetry(error: string) {
    return this.res.status(500).json({ success: false, error });
  }

  success(data?: any) {
    return this.res.status(200).json({
      status: 200,
      data,
    });
  }
}
