import { AppConfigMetadataManager } from "@/modules/configuration/app-config-metadata-manager";
import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { ChannelProviderConnectionConfig } from "@/modules/configuration/schemas/channel-provider-connection.schema";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";
import { z } from "zod";
import { FetchChannelsDocument } from "../../../generated/graphql";
import { TRPCError } from "@trpc/server";

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
    const channels = await ctx.apiClient.query(FetchChannelsDocument, {});

    return channels.data?.channels ?? [];
  }),
  fetchConnections: procedure.query(async ({ ctx }) => {
    return (await ctx.appConfigService.get()).connections.getConnections();
  }),
  fetchConnection: procedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return (await ctx.appConfigService.get()).connections.getConnectionById(input.id) ?? null;
  }),
  addConnection: procedure
    .input(ChannelProviderConnectionConfig.Schema.Input)
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.appConfigService.get();

      try {
        config.connections.addConnection(input);
      } catch (e) {
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.appConfigService.get();

      config.connections.deleteConnection(input.id);

      ctx.appConfigService.set(config);
    }),
});
