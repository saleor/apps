import { ChannelsFetcher } from "./channels-fetcher";
import { createClient } from "../../lib/create-graphql-client";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx }) => {
    const fetcher = new ChannelsFetcher(ctx.apiClient);

    return await fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
