import { createGraphQLClient, createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { createSettingsManager } from "../../lib/metadata";
import { AppConfigurationFields, AppConfigurationSchema } from "../../domain/configuration";
import { ChannelsDocument } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { TRPCError } from "@trpc/server";

const logger = createLogger({ name: "configuration.router" });

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const settingsManager = createSettingsManager(ctx.apiClient); // todo use shared pkg

    /**
     * Backwards compatbitility
     */
    const domain = new URL(ctx.saleorApiUrl).host;

    /**
     * TODO - refactor to single config in one key
     */
    const data: AppConfigurationFields = {
      secretKey: (await settingsManager.get("secretKey", domain)) || "",
      appId: (await settingsManager.get("appId", domain)) || "",
      indexNamePrefix: (await settingsManager.get("indexNamePrefix", domain)) || "",
    };

    logger.debug("Will return config");

    return data;
  }),
  setConfig: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(AppConfigurationSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: channelsData } = await ctx.apiClient.query(ChannelsDocument, {}).toPromise();
      const channels = channelsData?.channels || [];

      const algoliaClient = new AlgoliaSearchProvider({
        appId: ctx.appId,
        apiKey: input.secretKey,
        indexNamePrefix: input.indexNamePrefix,
        channels,
      });

      const settingsManager = createSettingsManager(ctx.apiClient); // todo use shared pkg

      /**
       * Backwards compatbitility
       */
      const domain = new URL(ctx.saleorApiUrl).host;

      try {
        logger.debug("Will ping Algolia");
        await algoliaClient.ping();

        logger.debug("Algolia connection is ok. Will save settings");

        await settingsManager.set([
          { key: "secretKey", value: input.secretKey || "", domain },
          { key: "appId", value: input.appId || "", domain },
          { key: "indexNamePrefix", value: input.indexNamePrefix || "", domain },
        ]);

        logger.debug("Settings set successfully");

        const webhooksToggler = new WebhookActivityTogglerService(ctx.appId, ctx.apiClient);

        await webhooksToggler.enableOwnWebhooks();

        logger.debug("Webhooks enabled");
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      return null;
    }),
});
