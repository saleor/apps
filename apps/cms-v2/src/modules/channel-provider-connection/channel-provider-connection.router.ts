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

    logger.debug("Channels fetched successfully", { channelsLength: channelData.length });

    return channelData;
  }),
  fetchConnections: procedure.query(async ({ ctx }) => {
    const logger = createLogger("channelProviderConnectionRouter.fetchConnections");

    logger.debug("Fetching connections");

    const connections = await (await ctx.appConfigService.get()).connections.getConnections();

    logger.debug("Connections fetched successfully", { connectionsLength: connections.length });

    return connections;
  }),
  fetchConnection: procedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const logger = createLogger("channelProviderConnectionRouter.fetchConnection");

    logger.debug("Fetching connection", { id: input.id });

    const connection =
      (await ctx.appConfigService.get()).connections.getConnectionById(input.id) ?? null;

    logger.debug("Connection fetched successfully", { connection });

    return connection;
  }),
  addConnection: procedure
    .input(ChannelProviderConnectionConfig.Schema.Input)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("channelProviderConnectionRouter.addConnection");

      logger.debug("Adding connection", { input });

      const config = await ctx.appConfigService.get();

      logger.debug("App config fetched successfully");

      try {
        config.connections.addConnection(input);

        logger.debug("Connection added successfully");
      } catch (e) {
        logger.error("Connection add failed", { error: e });
        switch ((e as { cause: string }).cause) {
          case "PROVIDER_DOESNT_EXIST":
            throw new TRPCError({
              code: "BAD_REQUEST",
              cause: "PROVIDER_DOESNT_EXIST",
              message: "Provider doesnt exist",
            });
          case "CONNECTION_ALREADY_EXISTS":
            throw new TRPCError({
              code: "CONFLICT",
              cause: "CONNECTION_EXISTS",
              message: "Connection already exists",
            });
        }
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
      const logger = createLogger("channelProviderConnectionRouter.removeConnection");

      logger.debug("Removing connection", { input });

      const config = await ctx.appConfigService.get();

      logger.debug("App config fetched successfully");

      config.connections.deleteConnection(input.id);

      logger.debug("Connection removed successfully");

      ctx.appConfigService.set(config);
    }),
});
