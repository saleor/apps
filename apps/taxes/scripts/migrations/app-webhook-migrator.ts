import { SaleorAsyncWebhook, SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { WebhookEventTypeAsyncEnum, WebhookEventTypeSyncEnum } from "../../generated/graphql";
import { AppWebhookRepository } from "./app-webhook-repository";
import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";

type AppWebhookMigratorOptions = {
  mode: "report" | "migrate";
};

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
    { mode }: AppWebhookMigratorOptions
  ) {
    this.appWebhookRepository = appWebhookRepository;

    this.appId = appId;
    this.apiUrl = apiUrl;
    this.mode = mode;
  }

  private registerWebhookFromHandler(webhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook) {
    const manifest = webhookHandler.getWebhookManifest(this.apiUrl);

    if (!manifest.query) {
      throw new Error("Webhook query is required");
    }

    if (!manifest.name) {
      throw new Error("Webhook name is required");
    }

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

  private async deleteWebhookById(webhookId: string) {
    console.log(`Webhook ${webhookId} will be deleted`);

    if (this.mode === "migrate") {
      await this.appWebhookRepository.delete(webhookId);

      console.log(`Webhook ${webhookId} deleted`);
    }
  }

  async getAppWebhooks() {
    const webhooks = await this.appWebhookRepository.getAll();

    console.log(`Webhooks for app ${this.appId}: `, webhooks);

    return webhooks;
  }

  private async deleteFirstWebhookByName(webhookName: string) {
    const webhooks = await this.getAppWebhooks();

    const webhook = webhooks.find((webhook) => webhook.name === webhookName);

    if (!webhook) {
      console.log(`Webhook ${webhookName} not found`);

      return;
    }

    await this.deleteWebhookById(webhook.id);
  }

  private async registerWebhookIfItDoesntExist(
    webhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook
  ) {
    const webhooks = await this.getAppWebhooks();

    const webhookExists = webhooks.some((webhook) => webhook.name === webhookHandler.name);

    if (webhookExists) {
      console.log(`Webhook ${webhookHandler.name} already exists`);

      return;
    }

    console.log(`Webhook ${webhookHandler.name} will be registered`);

    if (this.mode === "migrate") {
      await this.registerWebhookFromHandler(webhookHandler);
      console.log(`Webhook ${webhookHandler.name} registered`);
    }
  }

  async rollbackWebhookMigrations(webhookHandlers: (SaleorSyncWebhook | SaleorAsyncWebhook)[]) {
    const webhooks = await this.appWebhookRepository.getAll();

    console.log("Current app webhooks: ", webhooks);

    const webhooksToDelete = webhooks.filter((webhook) => {
      const webhookHandler = webhookHandlers.find((handler) => handler.name === webhook.name);

      return !!webhookHandler;
    });

    console.log("The following webhooks will be deleted: ", webhooksToDelete);

    for (const webhook of webhooksToDelete) {
      await this.deleteWebhookById(webhook.id);
    }

    // todo: recreate deleted webhooks
  }

  async migrateWebhook(
    prevWebhookName: string,
    nextWebhookHandler: SaleorSyncWebhook | SaleorAsyncWebhook
  ) {
    await this.registerWebhookIfItDoesntExist(nextWebhookHandler);
    await this.deleteFirstWebhookByName(prevWebhookName);
  }
}

export function createAppWebhookMigrator(env: AuthData, options: AppWebhookMigratorOptions) {
  const client = createGraphQLClient({
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
    options
  );
}
