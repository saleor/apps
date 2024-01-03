import { Client, OperationResult } from "urql";
import {
  DisableWebhookDocument,
  EnableWebhookDocument,
  FetchOwnWebhooksDocument,
  WebhookEventTypeEnum,
} from "../../generated/graphql";

export interface IWebhookActivityTogglerService {
  disableOwnWebhooks(webhooksIdsParam?: string[]): Promise<void>;
  enableOwnWebhooks(): Promise<void>;
}

/**
 * Original implementation in apps/search.
 *
 * TODO: Create common abstraction, shared by all apps.
 */
export class WebhooksActivityClient {
  constructor(private client: Pick<Client, "query" | "mutation">) {}

  private handleOperationFailure(r: OperationResult) {
    if (r.error || !r.data) {
      console.error(
        {
          error: r.error,
        },
        "Error disabling webhook",
      );
      throw new Error("Error disabling webhook");
    }
  }

  fetchAppWebhooksIDs(id: string) {
    return this.client
      .query(FetchOwnWebhooksDocument, { id })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        if (!r.data?.app?.webhooks) {
          throw new Error("Webhooks not registered for app, something is wrong");
        }

        return r.data?.app?.webhooks?.map((w) => w.id);
      });
  }

  disableSingleWebhook(id: string): Promise<void> {
    return this.client
      .mutation(DisableWebhookDocument, {
        id,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }

  enableSingleWebhook(id: string): Promise<void> {
    return this.client
      .mutation(EnableWebhookDocument, {
        id,
      })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return undefined;
      });
  }
}

export class WebhookActivityTogglerService implements IWebhookActivityTogglerService {
  /**
   * Extracted separate client for easier testing without touching graphQL
   */
  private webhooksClient: WebhooksActivityClient;

  constructor(
    private ownAppId: string,
    private client: Pick<Client, "query" | "mutation">,
    options?: {
      WebhooksClient: WebhooksActivityClient;
    },
  ) {
    this.webhooksClient = options?.WebhooksClient ?? new WebhooksActivityClient(this.client);
  }

  /**
   * Disable webhooks with provided IDs. If not provided, it will fetch them from Saleor
   */
  async disableOwnWebhooks(webhooksIdsParam?: string[]) {
    const webhooksIds =
      webhooksIdsParam ?? (await this.webhooksClient.fetchAppWebhooksIDs(this.ownAppId));

    console.log(webhooksIds, "Disabling own webhooks");

    if (!webhooksIds) {
      throw new Error("Failed fetching webhooks");
    }

    await Promise.all(webhooksIds.map((id) => this.webhooksClient.disableSingleWebhook(id)));
  }

  async enableOwnWebhooks() {
    const webhooksIds = await this.webhooksClient.fetchAppWebhooksIDs(this.ownAppId);

    console.info(webhooksIds, "Enabling own webhooks");

    if (!webhooksIds) {
      throw new Error("Failed fetching webhooks");
    }

    await Promise.all(webhooksIds.map((id) => this.webhooksClient.enableSingleWebhook(id)));
  }
}
