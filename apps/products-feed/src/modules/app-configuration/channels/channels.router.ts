import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { ChannelsFetcher } from "./channels-fetcher";
import { ChannelFragment } from "../../../../generated/graphql";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }): Promise<ChannelFragment[]> => {
    const fetcher = new ChannelsFetcher(ctx.apiClient);

    return fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
