import { type APL } from "@saleor/app-sdk/APL";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { type WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { type Logger } from "@saleor/apps-logger";

import { AppDeletedDocument } from "../../generated/graphql";
import { BaseError } from "../errors";

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

/**
 * @internal
 */
export const _buildSdkWebhook = ({ webhookPath, apl }: Pick<Params, "webhookPath" | "apl">) => {
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
 * @internal
 */
export const _innerAppDeletedHandler = async (
  { apl, hooks = {}, logger }: Params,
  ctx: WebhookContext<unknown>,
) => {
  const loggerParams = {
    saleorApiUrl: ctx.authData.saleorApiUrl
  }

  try {
    logger.info("APP_DELETED event received. Auth Data will be removed", loggerParams);

    try {
      await hooks.onEvent?.(ctx);
    } catch {
      // Ignore error from hook. Hook should include error handling
    }

    try {
      await apl.delete(ctx.authData.saleorApiUrl);

      logger.info("Auth Data removed successfully", loggerParams);

      try {
        await hooks.onAuthDataDeleted?.();
      } catch {
        // Ignore error from hook. Hook should include error handling
      }

      return new Response("ok", { status: 200 });
    } catch (e) {
      const error = BaseError.normalize(e);

      logger.error("Error deleting auth data on APP_DELETED", { error, ...loggerParams });

      try {
        await hooks.onAuthDataDeleteError?.(error);
      } catch {
        // Ignore error from hook. Hook should include error handling
      }

      return new Response("Failed to clean up auth data.", { status: 500 });
    }
  } catch (e) {
    const error = BaseError.normalize(e);

    logger.error("Failed to execute APP_DELETED event", { error, ...loggerParams });

    return new Response("Failed to clean up auth data.", { status: 500 });
  }
};

/**
 * TODO:
 * 1. Move to app-sdk
 * 2. Implement into non-monorepo apps
 */
export const createAppDeletedHandler = ({ apl, webhookPath, hooks = {}, logger }: Params) => {
  const webhook = _buildSdkWebhook({ apl, webhookPath });

  const handler = webhook.createHandler(async (_req, ctx) => {
    return _innerAppDeletedHandler({ logger, hooks, apl, webhookPath }, ctx);
  });

  return {
    handler: handler.bind(webhook),
    getWebhookManifest: webhook.getWebhookManifest.bind(webhook),
  };
};
