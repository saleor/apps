import { Client, OperationResult } from "urql";
import {
  DisableWebhookDocument,
  EnableWebhookDocument,
  FetchOwnWebhooksDocument,
} from "../../generated/graphql";
import { createLogger } from "../lib/logger";

const logger = createLogger({
  service: "WebhookActivityTogglerService",
});

export class WebhookActivityTogglerService {
  constructor(private ownAppId: string, private client: Client) {}

  private fetchOwnWebhooks() {
    return this.client
      .query(FetchOwnWebhooksDocument, { id: this.ownAppId })
      .toPromise()
      .then((r) => {
        this.handleOperationFailure(r);

        return r.data?.app?.webhooks?.map((w) => w.id);
      });
  }

  private disableSingleWebhook(webhookId: string) {
    return this.client
      .mutation(DisableWebhookDocument, {
        id: webhookId,
      })
      .toPromise();
  }

  private enableSingleWebhook(webhookId: string) {
    return this.client
      .mutation(EnableWebhookDocument, {
        id: webhookId,
      })
      .toPromise();
  }

  private handleOperationFailure(r: OperationResult) {
    if (r.error || !r.data) {
      logger.error(
        {
          error: r.error,
          appId: this.ownAppId,
        },
        "Error disabling webhook"
      );
      throw new Error("Error disabling webhook");
    }
  }

  // todo allow passing them, so webhook can deliver without extra call
  async disableOwnWebhooks() {
    const webhooksIds = await this.fetchOwnWebhooks();

    logger.info(webhooksIds, "Disabling own webhooks");

    if (!webhooksIds) {
      throw new Error("Failed fetching webhooks");
    }

    return Promise.all(
      webhooksIds.map((id) => this.disableSingleWebhook(id).then(this.handleOperationFailure))
    );
  }
  // todo allow passing them, so webhook can deliver without extra call
  async enableOwnWebhooks() {
    const webhooksIds = await this.fetchOwnWebhooks();

    logger.info(webhooksIds, "Enabling own webhooks");

    if (!webhooksIds) {
      throw new Error("Failed fetching webhooks");
    }

    return Promise.all(
      webhooksIds.map((id) => this.enableSingleWebhook(id).then(this.handleOperationFailure))
    );
  }
}
