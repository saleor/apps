import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";
import { documentClient } from "@/lib/dynamodb/segment-config-table";
import { createLogger } from "@/logger";

import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { WebhooksActivityClient } from "../webhooks/webhook-activity/webhook-activity-client";
import { WebhookActivityService } from "../webhooks/webhook-activity/webhook-activity-service";
import { DynamoDBConfigManager } from "./dynamodb-config-manager";

const logger = createLogger("configurationRouter");

const manager = new DynamoDBConfigManager({
  documentClient: documentClient,
  tableName: env.DYNAMODB_CONFIG_TABLE_NAME ?? "",
});

export const configurationRouter = router({
  getWebhookConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const webhookActivityClient = new WebhooksActivityClient(ctx.apiClient);
    const webhookActivityService = new WebhookActivityService(ctx.appId, webhookActivityClient);

    const isActiveResult = await webhookActivityService.getWebhooksIsActive();

    if (isActiveResult.isErr()) {
      logger.error("Error during fetching webhooks isActive", { error: isActiveResult.error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "There was an error with fetching webhooks information. Contact Saleor support.",
      });
    }

    return { areWebhooksActive: isActiveResult.value.some(Boolean) };
  }),
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const config = await manager.get({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
    });

    logger.debug("Successfully fetched config");

    return config.getConfig();
  }),
  setConfig: protectedClientProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const config = await manager.get({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
    });

    config.setSegmentWriteKey(input);

    await manager.set({ config, saleorApiUrl: ctx.saleorApiUrl, appId: ctx.appId });

    logger.debug("Successfully set config");

    const webhookActivityClient = new WebhooksActivityClient(ctx.apiClient);
    const webhookActivityService = new WebhookActivityService(ctx.appId, webhookActivityClient);

    const enableAppWebhooksResult = await webhookActivityService.enableAppWebhooks();

    if (enableAppWebhooksResult.isErr()) {
      logger.error("Error during enabling app webhooks", { error: enableAppWebhooksResult.error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "There with enabling app webhooks. Contact Saleor support.",
      });
    }
  }),
});
