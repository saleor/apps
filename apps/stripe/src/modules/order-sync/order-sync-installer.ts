import { type WebhookManifest } from "@saleor/app-sdk/types";
import { createAppWebhook } from "@saleor/webhook-utils";
import { err, ok, type Result, ResultAsync } from "neverthrow";
import { type Client } from "urql";

import { FetchOrderSyncStatusDocument } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";

type WebhookCreateInput = Parameters<typeof createAppWebhook>[0]["input"];

export const ORDER_SYNC_PERMISSION = "MANAGE_ORDERS";

const ENABLED_STATUS_CACHE_TTL_MS = 60 * 60 * 1000;

export type OrderSyncStatus = {
  hasPermission: boolean;
  hasWebhook: boolean;
};

/**
 * Syncing order data to Stripe needs the ORDER_CREATED webhook, which needs MANAGE_ORDERS.
 * Installations from before it was added to the manifest have neither: the permission is granted
 * by staff from the app UI, after which the app registers the webhook itself.
 */
export class OrderSyncInstaller {
  static FetchError = BaseError.subclass("OrderSyncInstaller.FetchError", {
    props: { _internalName: "OrderSyncInstaller.FetchError" as const },
  });
  static MissingPermissionError = BaseError.subclass("OrderSyncInstaller.MissingPermissionError", {
    props: { _internalName: "OrderSyncInstaller.MissingPermissionError" as const },
  });
  static WebhookCreateError = BaseError.subclass("OrderSyncInstaller.WebhookCreateError", {
    props: { _internalName: "OrderSyncInstaller.WebhookCreateError" as const },
  });

  /**
   * Only the enabled status is cached: it rarely changes once reached. A missing permission is
   * always checked again, because staff can grant it at any moment and Dashboard reloads the app
   * right after - a cached "missing" would keep asking for a permission that is already granted.
   *
   * ponytail: in-memory, so each serverless instance checks once per TTL. Move to DynamoDB if that's too often.
   */
  private enabledUntil = new Map<string, number>();

  private now: () => number;

  constructor(deps: { now: () => number } = { now: Date.now }) {
    this.now = deps.now;
  }

  async getStatus(args: {
    cacheKey: string;
    client: Client;
    webhookName: string;
  }): Promise<Result<OrderSyncStatus, InstanceType<typeof OrderSyncInstaller.FetchError>>> {
    const enabledUntil = this.enabledUntil.get(args.cacheKey);

    if (enabledUntil && enabledUntil > this.now()) {
      return ok({ hasPermission: true, hasWebhook: true });
    }

    const status = await this.fetchStatus(args);

    if (status.isOk() && status.value.hasPermission && status.value.hasWebhook) {
      this.markEnabled(args.cacheKey);
    }

    return status;
  }

  async enable(args: {
    cacheKey: string;
    client: Client;
    webhookManifest: WebhookManifest;
  }): Promise<
    Result<
      OrderSyncStatus,
      InstanceType<
        | typeof OrderSyncInstaller.FetchError
        | typeof OrderSyncInstaller.MissingPermissionError
        | typeof OrderSyncInstaller.WebhookCreateError
      >
    >
  > {
    const status = await this.fetchStatus({
      client: args.client,
      webhookName: args.webhookManifest.name,
    });

    if (status.isErr()) {
      return err(status.error);
    }

    if (!status.value.hasPermission) {
      return err(
        new OrderSyncInstaller.MissingPermissionError(
          `App doesn't have ${ORDER_SYNC_PERMISSION} permission`,
        ),
      );
    }

    if (!status.value.hasWebhook) {
      const { asyncEvents, syncEvents, isActive, name, targetUrl, query } = args.webhookManifest;

      const created = await ResultAsync.fromPromise(
        createAppWebhook({
          client: args.client,
          input: {
            asyncEvents: asyncEvents as WebhookCreateInput["asyncEvents"],
            syncEvents: syncEvents as WebhookCreateInput["syncEvents"],
            isActive,
            name,
            targetUrl,
            query,
          },
        }),
        (error) =>
          new OrderSyncInstaller.WebhookCreateError("Failed to create webhook", { cause: error }),
      );

      if (created.isErr()) {
        return err(created.error);
      }
    }

    this.markEnabled(args.cacheKey);

    return ok({ hasPermission: true, hasWebhook: true });
  }

  private markEnabled(cacheKey: string) {
    this.enabledUntil.set(cacheKey, this.now() + ENABLED_STATUS_CACHE_TTL_MS);
  }

  private async fetchStatus(args: {
    client: Client;
    webhookName: string;
  }): Promise<Result<OrderSyncStatus, InstanceType<typeof OrderSyncInstaller.FetchError>>> {
    const { data, error } = await args.client.query(FetchOrderSyncStatusDocument, {}).toPromise();

    if (error || !data?.app) {
      return err(
        new OrderSyncInstaller.FetchError("Failed to fetch app details", { cause: error }),
      );
    }

    return ok({
      hasPermission: data.app.permissions?.some((p) => p.code === ORDER_SYNC_PERMISSION) ?? false,
      hasWebhook: data.app.webhooks?.some((w) => w.name === args.webhookName) ?? false,
    });
  }
}
