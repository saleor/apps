import { type APL } from "@saleor/app-sdk/APL";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { type WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { type Logger } from "@saleor/apps-logger";

import { AppDeletedDocument } from "../generated/graphql";

type Params = {
  apl: APL;
  webhookPath: string;
  logger: Logger;
  hooks?: {
    onEvent?: (ctx: WebhookContext<unknown>) => void;
    onAuthDataDeleted?: () => void;
    onAuthDataDeleteError?: (e: Error) => void;
  };
};

/**
 * TODO:
 * 1. Move to app-sdk
 * 2. Implement into non-monorepo apps
 */
export const createAppDeletedHandler = ({ apl, webhookPath, hooks = {}, logger }: Params) => {
  const webhook = new SaleorAsyncWebhook({
    apl,
    name: "APP_DELETED",
    query: AppDeletedDocument,
    event: "APP_DELETED",
    isActive: true,
    webhookPath,
  });

  const handler = webhook.createHandler(async (_req, res, ctx) => {
    try {
      logger.info("APP_DELETED event received. Auth Data will be removed");

      hooks.onEvent?.(ctx);

      try {
        await apl.delete(ctx.authData.saleorApiUrl);

        hooks.onAuthDataDeleted?.();

        return res.status(200).end();
      } catch (e) {
        logger.error("Error deleting auth data on APP_DELETED", { error: e });

        hooks.onAuthDataDeleteError?.(e as Error);

        return res.status(500).send("Failed to clean up auth data.");
      }
    } catch (e) {
      logger.error("Failed to execute APP_DELETED event", { error: e });

      return res.status(500).send("Failed to clean up auth data.");
    }
  });

  return {
    handler: handler.bind(webhook),
    getWebhookManifest: webhook.getWebhookManifest.bind(webhook),
  };
};
