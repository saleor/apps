import { ChannelsFetcher } from "./channels-fetcher";
import { ChannelFragment } from "../../../generated/graphql";
import { createClient } from "../../lib/create-graphq-client";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }): Promise<ChannelFragment[]> => {
    const client = createClient(ctx.saleorApiUrl, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    const fetcher = new ChannelsFetcher(client);

    return fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
