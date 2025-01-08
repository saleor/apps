import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createLogger } from "@/logger";

import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { WebhooksActivityClient } from "../webhooks/webhook-activity/webhook-activity-client";
import { WebhookActivityService } from "../webhooks/webhook-activity/webhook-activity-service";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";

const logger = createLogger("configurationRouter");

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const manager = AppConfigMetadataManager.createFromAuthData({
      appId: ctx.appId,
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const config = await manager.get();

    logger.debug("Successfully fetched config");

    return config.getConfig();
  }),
  setConfig: protectedClientProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const manager = AppConfigMetadataManager.createFromAuthData({
      appId: ctx.appId,
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const config = await manager.get();

    config.setSegmentWriteKey(input);

    await manager.set(config);

    logger.debug("Successfully set config");

    try {
      const webhookActivityClient = new WebhooksActivityClient(ctx.apiClient);
      const webhookActivityService = new WebhookActivityService(ctx.appId, webhookActivityClient);

      await webhookActivityService.enableAppWebhooks();
    } catch (error) {
      logger.error("Error during enabling app webhooks", { error: error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "There with enabling app webhooks. Contact Saleor support.",
      });
    }
  }),
});
