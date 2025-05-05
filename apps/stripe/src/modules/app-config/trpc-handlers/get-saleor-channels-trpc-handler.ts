import { TRPCError } from "@trpc/server";
import { GraphQLClient } from "graphql-request";

import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetSaleorChannelsTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private readonly channelsFetcherFactory: (client: GraphQLClient) => ChannelsFetcher;

  constructor(deps: { channelsFetcherFactory: (client: GraphQLClient) => ChannelsFetcher }) {
    this.channelsFetcherFactory = deps.channelsFetcherFactory;
  }

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      const channelsFetcher = this.channelsFetcherFactory(ctx.apiClient);

      const channelsResult = await channelsFetcher.fetchChannels();

      if (channelsResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch channels, contact support",
        });
      }

      return channelsResult.value;
    });
  }
}
