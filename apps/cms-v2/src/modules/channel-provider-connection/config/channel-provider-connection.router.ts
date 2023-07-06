import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";
import { createGraphQLClient } from "@saleor/apps-shared";
import { FetchChannelsDocument } from "../../../../generated/graphql";
import { ChannelProviderConnectionSettingsManager } from "./channel-provider-connection-settings-manager";

export const channelProviderConnectionRouter = router({
  fetchAllChannels: protectedClientProcedure.query(async ({ ctx }) => {
    const channels = await ctx.apiClient.query(FetchChannelsDocument, {});

    return channels.data?.channels ?? [];
  }),
  fetchConnections: protectedClientProcedure.query(async ({ ctx }) => {
    const connections = await new ChannelProviderConnectionSettingsManager(
      createSettingsManager(ctx.apiClient, ctx.appId!)
    ).get();

    return connections.getConnections();
  }),
});
