import { Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/errors";

import { IWebhooksActivityClient, WebhooksActivityClient } from "./webhook-activity-client";

export interface IWebhookActivityService {
  enableAppWebhooks(): Promise<void>;
}

/**
 * Service responsible for managing app webhooks `isActive` state.
 */
export class WebhookActivityService implements IWebhookActivityService {
  private webhooksClient: IWebhooksActivityClient;

  private static WebhookActivityServiceWebhooksError = BaseError.subclass(
    "WebhookActivityServiceWebhooksError",
  );

  constructor(
    private ownAppId: string,
    private client: Pick<Client, "query" | "mutation">,
    options?: {
      WebhooksClient: IWebhooksActivityClient;
    },
  ) {
    this.webhooksClient = options?.WebhooksClient ?? new WebhooksActivityClient(this.client);
  }

  async enableAppWebhooks() {
    const webhooksIds = await this.webhooksClient.fetchAppWebhooksIDs(this.ownAppId);

    if (webhooksIds.isErr()) {
      throw new WebhookActivityService.WebhookActivityServiceWebhooksError(
        "Error while fetching webhooks IDs",
        {
          cause: webhooksIds.error,
        },
      );
    }

    const appWebhooksEnableResult = Result.combine(
      await Promise.all(webhooksIds.value.map((id) => this.webhooksClient.enableSingleWebhook(id))),
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
