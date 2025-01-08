import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/errors";

import { IWebhooksActivityClient } from "./webhook-activity-client";

export interface IWebhookActivityService {
  enableAppWebhooks(): Promise<Result<undefined, unknown>>;
  getWebhooksIsActive(): Promise<Result<boolean[], unknown>>;
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

  async getWebhooksIsActive() {
    const webhooksIds = await this.client.fetchAppWebhooksInformation(this.ownAppId);

    if (webhooksIds.isErr()) {
      return err(
        new WebhookActivityService.WebhookActivityServiceWebhooksError(
          "Error while fetching webhooks IDs",
          {
            cause: webhooksIds.error,
          },
        ),
      );
    }

    return ok(webhooksIds.value.map((webhook) => webhook.isActive));
  }

  async enableAppWebhooks() {
    const webhooksResult = await this.client.fetchAppWebhooksInformation(this.ownAppId);

    if (webhooksResult.isErr()) {
      return err(
        new WebhookActivityService.WebhookActivityServiceWebhooksError(
          "Error while fetching webhooks IDs",
          {
            cause: webhooksResult.error,
          },
        ),
      );
    }

    const appWebhooksEnableResult = Result.combine(
      await Promise.all(
        webhooksResult.value.map((webhook) => this.client.enableSingleWebhook(webhook.id)),
      ),
    );

    if (appWebhooksEnableResult.isErr()) {
      return err(
        new WebhookActivityService.WebhookActivityServiceWebhooksError(
          "Error while enabling app webhooks",
          {
            cause: appWebhooksEnableResult.error,
          },
        ),
      );
    }

    return ok(undefined);
  }
}
