import { SaleorAsyncWebhook, SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../../generated/graphql";
import { AppWebhookRepository } from "./app-webhook-repository";

/*
 * Previously, the Avatax transactions were created on ORDER_CREATED webhook and commited on ORDER_FULFILLED webhook.
 * Now, the Avatax transactions are created and commited (if `isAutocommit`: true) on ORDER_CONFIRMED webhook.
 * If transaction was created on ORDER_CREATED and we remove the ORDER_FULFILLED webhook, the transaction can never be commited.
 * Therefore, the `ORDER_FULFILLED` can't be removed.
 */
/*
 * Migration plan:
 * ORDER_CREATED -> ORDER_CONFIRMED. Create ORDER_CONFIRMED webhook if doesn't exists. Delete ORDER_CREATED webhook.
 * ORDER_FULFILLED -> ❌. Delete ORDER_FULFILLED webhook some time.
 */

export class AppWebhookMigrator {
  private appWebhookRepository: AppWebhookRepository;
  private appId: string;
  private apiUrl: string;

  constructor({ apiUrl, appToken, appId }: { apiUrl: string; appToken: string; appId: string }) {
    this.appWebhookRepository = new AppWebhookRepository({
      apiUrl,
      appToken,
    });

    this.appId = appId;
    this.apiUrl = apiUrl;
  }

  async getAppWebhooks() {
    return this.appWebhookRepository.getAll();
  }

  private registerWebhookFromHandler(webhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook) {
    const manifest = webhookHandler.getWebhookManifest(this.apiUrl);

    return this.appWebhookRepository.create({
      appId: this.appId,
      name: manifest.name ?? "",
      query: manifest.query ?? "",
      targetUrl: manifest.targetUrl,
      asyncEvents: (manifest.asyncEvents ?? []) as WebhookEventTypeAsyncEnum[],
      syncEvents: (manifest.syncEvents ?? []) as WebhookEventTypeSyncEnum[],
      isActive: manifest.isActive ?? true,
    });
  }

  async registerWebhookIfItDoesntExist(webhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook) {
    const webhooks = await this.getAppWebhooks();

    console.log("Current app webhooks: ", webhooks);
    const manifest = webhookHandler.getWebhookManifest(this.apiUrl);

    const webhookExists = webhooks.some((webhook) => webhook.name === manifest.name);

    if (webhookExists) {
      console.log(`Webhook ${manifest.name} already exists`);

      return;
    }

    await this.registerWebhookFromHandler(webhookHandler);

    console.log(`Webhook ${manifest.name} registered`);
  }

  async rollbackWebhookMigrations(webhookHandlers: (SaleorSyncWebhook | SaleorAsyncWebhook)[]) {
    const webhooks = await this.getAppWebhooks();

    const webhooksToDelete = webhooks.filter((webhook) => {
      const webhookHandler = webhookHandlers.find((handler) => handler.name === webhook.name);

      return !!webhookHandler;
    });

    console.log("Webhooks to delete: ", webhooksToDelete);

    /*
     * for (const webhook of webhooksToDelete) {
     *   await this.appWebhookRepository.delete(webhook.id);
     */

    /*
     *   console.log(`Webhook ${webhook.name} deleted`);
     * }
     */
  }
}
