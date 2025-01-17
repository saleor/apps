import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createLogger } from "@/logger";

import { DynamoConfigRepositoryFactory } from "../db/dynamo-config-factory";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { WebhooksActivityClient } from "../webhooks/webhook-activity/webhook-activity-client";
import { WebhookActivityService } from "../webhooks/webhook-activity/webhook-activity-service";
import { AppConfig } from "./app-config";
import { DynamoDBAppConfigManager } from "./dynamo-app-config-manager";

const logger = createLogger("configurationRouter");

const configRepository = DynamoConfigRepositoryFactory.create();
const configManager = DynamoDBAppConfigManager.create(configRepository);

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
    const config = await configManager.get({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
    });

    logger.debug("Successfully fetched config");

    if (config) {
      return config.getConfig();
    }

    // if there is no config present, create a new one with empty values but don't save it yet to DynamoDB so we don't have empty values there
    const newAppConfig = new AppConfig();

    return newAppConfig.getConfig();
  }),
  setConfig: protectedClientProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    let config: AppConfig | null;

    config = await configManager.get({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
    });

    if (!config) {
      // there is no config in DynamoDB - create new one and then set segmentWriteKey
      config = new AppConfig();
    }

    config.setSegmentWriteKey(input);

    await configManager.set({ config, saleorApiUrl: ctx.saleorApiUrl, appId: ctx.appId });

    logger.debug("Successfully set config");

    const webhookActivityClient = new WebhooksActivityClient(ctx.apiClient);
    const webhookActivityService = new WebhookActivityService(ctx.appId, webhookActivityClient);

    const enableAppWebhooksResult = await webhookActivityService.enableAppWebhooks();

    if (enableAppWebhooksResult.isErr()) {
      logger.error("Error during enabling app webhooks", { error: enableAppWebhooksResult.error });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "There is a problem with enabling app webhooks. Contact Saleor support.",
      });
    }
  }),
});
