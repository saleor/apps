import { TRPCError } from "@trpc/server";
import { Client } from "urql";

import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetSaleorChannelsTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private readonly channelsFetcherFactory: (client: Client) => ChannelsFetcher;

  constructor(deps: { channelsFetcherFactory: (client: Client) => ChannelsFetcher }) {
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
          cause: channelsResult.error,
        });
      }

      return channelsResult.value;
    });
  }
}
