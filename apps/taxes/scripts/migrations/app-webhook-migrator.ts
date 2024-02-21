import { SaleorAsyncWebhook, SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../../generated/graphql";
import { AppWebhookRepository } from "./app-webhook-repository";
import { AuthData } from "@saleor/app-sdk/APL";
import { createInstrumentedGraphqlClient } from "../../src/lib/create-instrumented-graphql-client";

type AppWebhookMigratorOptions = {
  mode: "report" | "migrate";
};

type AppWebhookHandler = SaleorSyncWebhook | SaleorAsyncWebhook;

export class AppWebhookMigrator {
  private appWebhookRepository: AppWebhookRepository;
  private appId: string;
  private apiUrl: string;
  private mode: AppWebhookMigratorOptions["mode"];

  constructor(
    {
      appWebhookRepository,
      apiUrl,
      appId,
    }: {
      apiUrl: string;
      appId: string;
      appWebhookRepository: AppWebhookRepository;
    },
    { mode }: AppWebhookMigratorOptions,
  ) {
    this.appWebhookRepository = appWebhookRepository;

    this.appId = appId;
    this.apiUrl = apiUrl;
    this.mode = mode;
  }

  private registerWebhookFromHandler(webhookHandler: AppWebhookHandler) {
    const manifest = webhookHandler.getWebhookManifest(this.apiUrl);

    if (!manifest.query) {
      throw new Error("Webhook query is required");
    }

    if (!manifest.name) {
      throw new Error("Webhook name is required");
    }

    console.log(`⏳ Webhook ${manifest.name} will be registered`);

    if (this.mode === "migrate") {
      return this.appWebhookRepository.create({
        appId: this.appId,
        name: manifest.name,
        query: manifest.query,
        targetUrl: manifest.targetUrl,
        asyncEvents: (manifest.asyncEvents ?? []) as WebhookEventTypeAsyncEnum[],
        syncEvents: (manifest.syncEvents ?? []) as WebhookEventTypeSyncEnum[],
        isActive: manifest.isActive ?? true,
      });
    }
  }

  private async deleteWebhookById(webhookId: string) {
    console.log(`⏳ Webhook ${webhookId} will be deleted`);

    if (this.mode === "migrate") {
      await this.appWebhookRepository.delete(webhookId);

      console.log(`✅ Webhook ${webhookId} deleted`);
    }
  }

  private async disableWebhookById(webhookId: string) {
    console.log(`⏳ Webhook ${webhookId} will be disabled`);

    if (this.mode === "migrate") {
      await this.appWebhookRepository.disable(webhookId);

      console.log(`✅ Webhook ${webhookId} disabled`);
    }
  }

  /**
   * @returns all webhooks for the app
   * @throws error if fetching webhooks fails
   */
  async getAppWebhooks() {
    const webhooks = await this.appWebhookRepository.getAll();

    console.log(`📖 Webhooks for app ${this.appId}: `, webhooks);

    return webhooks;
  }

  private async disableFirstWebhookByName(webhookName: string) {
    const webhooks = await this.getAppWebhooks();

    const webhook = webhooks.find((webhook) => webhook.name === webhookName);

    if (!webhook) {
      console.log(`🚧 Webhook ${webhookName} not found`);

      return;
    }

    await this.disableWebhookById(webhook.id);
  }

  /**
   * Deletes first app webhook that matches the name.
   * @param webhookName - name of the webhook to delete
   */
  async DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME(webhookName: string) {
    const webhooks = await this.getAppWebhooks();

    const webhook = webhooks.find((webhook) => webhook.name === webhookName);

    if (!webhook) {
      console.log(`🚧 Webhook ${webhookName} not found`);

      return;
    }

    await this.deleteWebhookById(webhook.id);
  }

  async updateWebhookQueryByHandler(webhookHandler: AppWebhookHandler) {
    const webhooks = await this.getAppWebhooks();

    const manifest = webhookHandler.getWebhookManifest(this.apiUrl);
    const webhookName = manifest.name;

    const webhook = webhooks.find((webhook) => webhook.name === webhookName);

    if (!webhook) {
      console.log(`🚧 Webhook ${webhookName} not found`);

      return;
    }

    console.log(`⏳ Webhook ${webhookName} query will be updated`);

    if (this.mode === "migrate") {
      await this.appWebhookRepository.update(webhook.id, { query: manifest.query });
      console.log(`✅ Webhook ${webhookName} query updated`);
    }
  }

  /**
   * Registers a webhook if it doesn't exist based on a handler.
   * @param webhookHandler - The handler of the webhook we want to register.
   * @example registerWebhookIfItDoesntExist(orderConfirmedAsyncWebhook)
   */
  async registerWebhookIfItDoesntExist(webhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook) {
    const webhooks = await this.getAppWebhooks();

    const webhookExists = webhooks.some((webhook) => webhook.name === webhookHandler.name);

    if (webhookExists) {
      console.log(`🚧 Webhook ${webhookHandler.name} already exists`);

      return;
    }

    console.log(`⏳ Webhook ${webhookHandler.name} will be registered`);

    if (this.mode === "migrate") {
      await this.registerWebhookFromHandler(webhookHandler);
      console.log(`✅ Webhook ${webhookHandler.name} registered`);
    }
  }

  /**
   * Rolls back webhook migration by deleting the new webhook and enabling the old one.
   * @param prevWebhookName - The name of the webhook we wanted to migrate from.
   * @param nextWebhookHandler - The handler of the webhook we wanted to migrate to.
   * @example rollbackWebhookMigrations("OrderCreated", orderConfirmedAsyncWebhook)
   */
  async rollbackWebhookMigrations(
    prevWebhookName: string,
    nextWebhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook,
  ) {
    const webhooks = await this.appWebhookRepository.getAll();

    const webhooksToRemove = webhooks.filter((webhook) => webhook.name === nextWebhookHandler.name);
    const webhooksToEnable = webhooks.filter((webhook) => webhook.name === prevWebhookName);

    for (const webhook of webhooksToRemove) {
      await this.deleteWebhookById(webhook.id);
    }

    for (const webhook of webhooksToEnable) {
      await this.appWebhookRepository.enable(webhook.id);
    }
  }
}

export function createAppWebhookMigrator(env: AuthData, options: AppWebhookMigratorOptions) {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: env.saleorApiUrl,
    token: env.token,
  });
  const appWebhookRepository = new AppWebhookRepository(client);

  return new AppWebhookMigrator(
    {
      apiUrl: env.saleorApiUrl,
      appId: env.appId,
      appWebhookRepository,
    },
    options,
  );
}
