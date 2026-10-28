import { TRPCError } from "@trpc/server";

import { orderCreatedWebhookDefinition } from "@/app/api/webhooks/saleor/order-created/webhook-definition";
import { env } from "@/lib/env";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { createLogger } from "@/lib/logger";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

import { OrderSyncInstaller } from "./order-sync-installer";

const logger = createLogger("orderSyncRouter");

const installer = new OrderSyncInstaller();

/**
 * App permissions and webhooks are read with the app token - the Dashboard user token
 * from the context belongs to staff and doesn't see the app's own data.
 */
const withAppClient = protectedClientProcedure.use(({ ctx, next }) =>
  next({
    ctx: {
      appClient: createInstrumentedGraphqlClient({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      }),
      cacheKey: `${ctx.saleorApiUrl}:${ctx.appId}`,
    },
  }),
);

export const orderSyncRouter = router({
  getStatus: withAppClient.query(async ({ ctx }) => {
    const result = await installer.getStatus({
      cacheKey: ctx.cacheKey,
      client: ctx.appClient,
      webhookName: orderCreatedWebhookDefinition.name,
    });

    if (result.isErr()) {
      logger.warn("Failed to fetch order sync status", { error: result.error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check order sync status",
      });
    }

    return result.value;
  }),
  enable: withAppClient.mutation(async ({ ctx }) => {
    const apiBaseUrl = env.APP_API_BASE_URL ?? ctx.appUrl;

    if (!apiBaseUrl) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Missing app URL" });
    }

    const result = await installer.enable({
      cacheKey: ctx.cacheKey,
      client: ctx.appClient,
      webhookManifest: orderCreatedWebhookDefinition.getWebhookManifest(apiBaseUrl),
    });

    if (result.isErr()) {
      if (result.error instanceof OrderSyncInstaller.MissingPermissionError) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: result.error.message });
      }

      logger.error("Failed to enable order sync", { error: result.error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to enable order sync, try again",
      });
    }

    logger.info("Order sync enabled");

    return result.value;
  }),
});
