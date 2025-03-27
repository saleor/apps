import { err, ok, Result } from "neverthrow";
import { Client } from "urql";

import { BaseError } from "@/errors";
import { EnableWebhookDocument, FetchAppWebhooksDocument } from "@/generated/graphql";

export interface IWebhooksActivityClient {
  fetchAppWebhooksInformation(
    id: string,
  ): Promise<Result<{ id: string; isActive: boolean }[], unknown>>;
  enableSingleWebhook(id: string): Promise<Result<undefined, unknown>>;
}

export class WebhooksActivityClient implements IWebhooksActivityClient {
  private static FetchAppWebhooksError = BaseError.subclass("FetchAppWebhooksError");

  constructor(private client: Pick<Client, "query" | "mutation">) {}

  async fetchAppWebhooksInformation(id: string) {
    const result = await this.client.query(FetchAppWebhooksDocument, { id }).toPromise();

    if (result.error || !result.data) {
      return err(
        new WebhooksActivityClient.FetchAppWebhooksError("Error fetching app webhooks", {
          cause: result.error,
        }),
      );
    }

    if (!result.data?.app?.webhooks) {
      return err(
        new WebhooksActivityClient.FetchAppWebhooksError(
          "Couldnt find webhooks registered for app. Check if app is properly registered",
        ),
      );
    }

    return ok(result.data.app.webhooks.map((w) => w));
  }

  async enableSingleWebhook(id: string) {
    const result = await this.client
      .mutation(EnableWebhookDocument, {
        id,
      })
      .toPromise();

    if (result.error || !result.data) {
      return err(
        new WebhooksActivityClient.FetchAppWebhooksError("Error fetching app webhooks", {
          cause: result.error,
        }),
      );
    }

    const possibleErrors = result.data.webhookUpdate?.errors ?? [];

    if (possibleErrors.length > 0) {
      return err(
        new WebhooksActivityClient.FetchAppWebhooksError("Error enabling webhook", {
          errors: possibleErrors.map((error) =>
            WebhooksActivityClient.FetchAppWebhooksError.normalize(error),
          ),
        }),
      );
    }

    return ok(undefined);
  }
}
