import { Result } from "neverthrow";

import { BaseError } from "@/errors";

import { IWebhooksActivityClient } from "./webhook-activity-client";

export interface IWebhookActivityService {
  enableAppWebhooks(): Promise<void>;
}

/**
 * Service responsible for managing app webhooks `isActive` state.
 */
export class WebhookActivityService implements IWebhookActivityService {
  static WebhookActivityServiceWebhooksError = BaseError.subclass(
    "WebhookActivityServiceWebhooksError",
  );

  constructor(
    private ownAppId: string,
    private client: IWebhooksActivityClient,
  ) {}

  async enableAppWebhooks() {
    const webhooksIds = await this.client.fetchAppWebhooksIDs(this.ownAppId);

    if (webhooksIds.isErr()) {
      throw new WebhookActivityService.WebhookActivityServiceWebhooksError(
        "Error while fetching webhooks IDs",
        {
          cause: webhooksIds.error,
        },
      );
    }

    const appWebhooksEnableResult = Result.combine(
      await Promise.all(webhooksIds.value.map((id) => this.client.enableSingleWebhook(id))),
    );

    if (appWebhooksEnableResult.isErr()) {
      throw new WebhookActivityService.WebhookActivityServiceWebhooksError(
        "Error while enabling app webhooks",
        {
          cause: appWebhooksEnableResult.error,
        },
      );
    }
  }
}
