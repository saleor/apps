import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { ChannelsFetcher } from "./channels-fetcher";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx }) => {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.token,
    });

    const fetcher = new ChannelsFetcher(client);

    return await fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
