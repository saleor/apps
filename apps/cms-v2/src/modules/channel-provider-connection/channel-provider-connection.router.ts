import { AppConfigMetadataManager } from "@/modules/configuration/app-config-metadata-manager";
import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { ChannelProviderConnectionConfig } from "@/modules/configuration/schemas/channel-provider-connection.schema";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";
import { z } from "zod";
import { FetchChannelsDocument } from "../../../generated/graphql";
import { TRPCError } from "@trpc/server";
import { createLogger } from "../../logger";

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      appConfigService: new AppConfigMetadataManager(settingsManager),
    },
  });
});

export const channelProviderConnectionRouter = router({
  fetchAllChannels: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger("channelProviderConnectionRouter.fetchAllChannels");

    logger.debug("Fetching channels");

    const channels = await ctx.apiClient.query(FetchChannelsDocument, {});
    const channelData = channels.data?.channels ?? [];

    logger.debug("Channels fetched successfully", { channelsIds: channelData.map((c) => c.id) });

    return channelData;
  }),
  fetchConnections: procedure.query(async ({ ctx }) => {
    const logger = createLogger("channelProviderConnectionRouter.fetchConnections");

    logger.debug("Fetching connections");

    const connections = (await ctx.appConfigService.get()).connections.getConnections();

    logger.debug("Connections fetched successfully", {
      connectionsIds: connections.map((c) => c.id),
    });

    return connections;
  }),
  fetchConnection: procedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const logger = createLogger("channelProviderConnectionRouter.fetchConnection");

    logger.debug("Fetching connection", { connectionId: input.id });

    const connection =
      (await ctx.appConfigService.get()).connections.getConnectionById(input.id) ?? null;

    logger.debug("Connection fetched successfully", { connection });

    return connection;
  }),
  addConnection: procedure
    .input(ChannelProviderConnectionConfig.Schema.Input)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("channelProviderConnectionRouter.addConnection");

      logger.debug("Adding connection", {
        providerId: input.providerId,
        channelSlug: input.channelSlug,
        providerType: input.providerType,
      });

      const config = await ctx.appConfigService.get();

      logger.trace("App config fetched successfully");

      try {
        config.connections.addConnection(input);

        logger.info("Connection added successfully", {
          providerId: input.providerId,
          channelSlug: input.channelSlug,
          providerType: input.providerType,
        });
      } catch (e) {
        switch ((e as { cause: string }).cause) {
          case "PROVIDER_DOESNT_EXIST":
            logger.warn("Provider doesnt exist");
            throw new TRPCError({
              code: "BAD_REQUEST",
              cause: "PROVIDER_DOESNT_EXIST",
              message: "Provider doesnt exist",
            });
          case "CONNECTION_ALREADY_EXISTS":
            logger.warn("Connection already exists");
            throw new TRPCError({
              code: "CONFLICT",
              cause: "CONNECTION_EXISTS",
              message: "Connection already exists",
            });
        }

        logger.error("Error adding connection", { error: e });
      }

      ctx.appConfigService.set(config);
    }),
  removeConnection: procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("channelProviderConnectionRouter.removeConnection", {
        connectionId: input.id,
      });

      logger.debug("Removing connection", { connectionId: input.id });

      const config = await ctx.appConfigService.get();

      logger.trace("App config fetched successfully");

      config.connections.deleteConnection(input.id);

      logger.info("Connection removed successfully");

      ctx.appConfigService.set(config);
    }),
});
