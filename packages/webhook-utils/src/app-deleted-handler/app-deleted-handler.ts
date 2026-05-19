import { type APL } from "@saleor/app-sdk/APL";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { type WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { type Logger } from "@saleor/apps-logger";

import { AppDeletedDocument } from "../../generated/graphql";

type Params = {
  apl: APL;
  webhookPath: string;
  logger: Logger;
  /**
   * Additional hooks that can be executed by the handler.
   * Error thrown in them are silently dropped.
   * Each hook should include their own error handling:
   *
   * e.g.
   *
   * hooks: {
   *   onAuthDataDeleted: async () => {
   *     try {
   *       callDb()
   *     } catch {
   *       logger.error("Failed to call db")
   *     }
   *   }
   * }
   */
  hooks?: {
    onEvent?: (ctx: WebhookContext<unknown>) => Promise<void>;
    onAuthDataDeleted?: () => Promise<void>;
    onAuthDataDeleteError?: (e: Error) => Promise<void>;
  };
};

export const buildSdkWebhook = ({ webhookPath, apl }: Pick<Params, "webhookPath" | "apl">) => {
  return new SaleorAsyncWebhook({
    apl,
    name: "APP_DELETED",
    query: AppDeletedDocument,
    event: "APP_DELETED",
    isActive: true,
    webhookPath,
  });
};

/**
 * TODO:
 * 1. Move to app-sdk
 * 2. Implement into non-monorepo apps
 */
export const createAppDeletedHandler = ({ apl, webhookPath, hooks = {}, logger }: Params) => {
  const webhook = buildSdkWebhook({apl, webhookPath});

  const handler = webhook.createHandler(async (_req, ctx) => {
    try {
      logger.info("APP_DELETED event received. Auth Data will be removed");

      // Ignore error from hook. Hook should include error handling
      await hooks.onEvent?.(ctx).catch();

      try {
        await apl.delete(ctx.authData.saleorApiUrl);

        // Ignore error from hook. Hook should include error handling
        await hooks.onAuthDataDeleted?.().catch();

        return new Response("ok", { status: 200 });
      } catch (e) {
        logger.error("Error deleting auth data on APP_DELETED", { error: e });

        // Ignore error from hook. Hook should include error handling
        await hooks.onAuthDataDeleteError?.(e as Error).catch();

        return new Response("Failed to clean up auth data.", { status: 500 });
      }
    } catch (e) {
      logger.error("Failed to execute APP_DELETED event", { error: e });

      return new Response("Failed to clean up auth data.", { status: 500 });
    }
  });

  return {
    handler: handler.bind(webhook),
    getWebhookManifest: webhook.getWebhookManifest.bind(webhook),
  };
};
